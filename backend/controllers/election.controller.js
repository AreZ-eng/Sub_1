const db = require("../models");
const User = db.user;
const Vote = db.vote;
const Candidate = db.candidate;
const { validationResult } = require("express-validator");
const { encVote, addEncryptedBallots } = require("../tools/keys");
const crypto = require("crypto");
const axios = require("axios");
const https = require("https");
const bcrypt = require('bcrypt');
const { totalPassword } = require('../configs/auth.config.js');
const { mainApiBaseUrl } = require("../configs/service.config");

exports.getCandidate = async (req, res) => {
    try {
        const candidates = await Candidate.findAll({
            attributes: ['candidateNumber', 'name', 'party', 'description', 'photourl'],});
        if (!candidates || candidates.length === 0) {
            console.error(`[ELECTION] getCandidate - Error: No candidates found`);
            return res.status(404).json({ message: "No candidates found" });
        }
        console.error(`[ELECTION] getCandidate success`);
        return res.status(200).json({ message: "Candidates ready", candidates });
    } catch (error) {
        console.error(`[ELECTION] getCandidate - Error:`, error);
        return res.status(500).json({ message: "Error fetching candidates", error });
    }
};

const candidateUuidToNumber = {
    "3e4d0d91-1b75-4a2c-97a0-87cfdad10b3a": 1,
    "7f64bde3-9334-4b12-a9d1-5096d270f630": 2,
    "a2cfa146-fb2e-4a3a-8c61-e02438e1c6e2": 3,
};

exports.makeVoting = async (req, res) => {
    console.log(`[ELECTION] makeVoting for ${req.id}`);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error(`[ELECTION] makeVoting - Error: Validation errors for user ${req.id}`, errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    const { candidate, tps } = req.body;
    const userId = req.id;
    const token = req.token;

    const transaction = await User.sequelize.transaction();

    try {
        const existingVote = await Vote.findOne({ where: { userId }, transaction });
        if (existingVote) {
            console.error(`[ELECTION] makeVoting - Error: User ${req.id} has already voted`);
            return res.status(409).json({ message: "User has already voted." });
        }

        const selectedCandidate = await Candidate.findOne({ where: { candidateNumber: candidate } });
        if (!selectedCandidate) {
            console.error(`[ELECTION] makeVoting - Error: Invalid candidate selection ${candidate} for user ${req.id}`);
            return res.status(400).json({ message: "Invalid candidate selection." });
        }

        const candidateNumber = candidateUuidToNumber[selectedCandidate.candidateNumber];
        if (!candidateNumber) {
            console.error(`[ELECTION] makeVoting - Error: Candidate UUID ${selectedCandidate.candidateNumber} not mapped for user ${req.id}`);
            return res.status(400).json({ message: "Candidate UUID not mapped." });
        }

        const candidatesCount = await Candidate.count();
        const voteArray = new Array(candidatesCount).fill(0);
        voteArray[candidateNumber - 1] = 1;

        const encryptedVote = await encVote(voteArray);
        const hash = crypto.createHash("sha256").update(encryptedVote + userId + tps).digest("hex");

        await Vote.create(
            {
                userId: userId,
                voteTo: encryptedVote,
            },
            { transaction }
        );
        
        const agent = new https.Agent({ rejectUnauthorized: false });
        try {
            const mainApiResponse = await axios.post(
                `${mainApiBaseUrl}/api/election/finishvoting`,
                { hash },
                {
                    headers: { Authorization: `Bearer ${token}` },
                    httpsAgent: agent,
                }
            );

            await transaction.commit();
            console.log(`[ELECTION] makeVoting - Success: ${req.id}`);
            return res.status(200).json({
                message: "Vote successfully recorded.",
                mainApiResponse: mainApiResponse.data,
            });
        } catch (mainApiError) {
            await transaction.rollback();
            console.error(`[ELECTION] makeVoting - Error: Main API communication failed for user ${req.id}`, mainApiError.response?.data || mainApiError.message);
            return res.status(502).json({
                message: "Vote recorded, but failed to notify MAIN API.",
                error: mainApiError.response?.data || mainApiError.message,
            });
        }
    } catch (error) {
        console.error(`[ELECTION] makeVoting - Error:`, error);
        await transaction.rollback();
        return res.status(500).json({ message: "Error processing the vote", error });
    }
};

exports.totalBallots = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error(`[ELECTION] totalBallots - Error: Validation errors`, errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    const password = req.body.password;
    const dpassword = totalPassword;

    try {
        const isPasswordValid = await bcrypt.compare(password, dpassword);

        if (!isPasswordValid) {
            console.error(`[ELECTION] totalBallots - Error: Invalid password provided`);
            return res.status(403).json({ message: "Invalid password." });
        }

        const votes = await Vote.findAll({
            attributes: ["voteTo"],
        });

        if (!votes || votes.length === 0) {
            console.error(`[ELECTION] totalBallots - Error: No ballots found`);
            return res.status(404).json({ message: "No ballots found." });
        }

        const totalEncryptedVotes = addEncryptedBallots(votes);

        const fs = require('fs');
        const path = require('path');

        const outputData = totalEncryptedVotes.map((e, index) => ({
            candidate: `Candidate ${index + 1}`,
            totalEncryptedVote: e
        }));

        const outputFolder = path.join(__dirname, '../exports');
        if (!fs.existsSync(outputFolder)) {
            fs.mkdirSync(outputFolder, { recursive: true });
        }
        const outputFile = path.join(outputFolder, `total_ballots_${Date.now()}.json`);

        if (!fs.existsSync(outputFolder)) {
            fs.mkdirSync(outputFolder, { recursive: true });
        }

        fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2));

        console.log(`[ELECTION] totalBallots - Success`);
        return res.status(200).json({
            message: "The ballots calculated successfully.",
            totalEncryptedVotes: totalEncryptedVotes,
            exportFile: outputFile,
        });
    } catch (error) {
        console.error(`[ELECTION] totalBallots - Error:`, error);
        return res.status(500).json({ message: "Error calculating total ballots", error });
    }
};

const { Op } = require("sequelize");

exports.resetVotes = async (req, res) => {
    console.log(`[ELECTION] resetVotes for ${req.id}`);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error(`[ELECTION] resetVotes - Error: Validation errors for user ${req.id}`, errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    let { ids } = req.body;
    if (!Array.isArray(ids)) {
        ids = [ids];
    }

    try {
        const votes = await Vote.findAll({
            where: { userId: { [Op.in]: ids } },
        });

        if (!votes || votes.length === 0) {
            console.log(`[ELECTION] resetVotes - No votes found for user ${req.id}, continuing...`);
            return res.status(200).json({ message: "No votes found. Continue..." });
        }

        await Vote.destroy({
            where: { userId: { [Op.in]: ids } }
        });

        console.log(`[ELECTION] resetVotes - Success votes deleted for ${req.id})`);
        return res.status(200).json({ message: "Votes reset successfully." });
    } catch (error) {
        console.error(`[ELECTION] resetVotes - Error:`, error);
        return res.status(500).json({ message: "Error resetting votes", error });
    }
};

exports.getBallots = async (req, res) => {
    const fs = require('fs');
    const path = require('path');

    try {
        const outputFolder = path.join(__dirname, '../exports');
        if (!fs.existsSync(outputFolder)) {
            fs.mkdirSync(outputFolder, { recursive: true });
        }
        
        const files = fs.readdirSync(outputFolder)
            .filter(f => f.startsWith('total_ballots_') && f.endsWith('.json'))
            .sort((a, b) => {
                const aTime = parseInt(a.split('_')[2]);
                const bTime = parseInt(b.split('_')[2]);
                return bTime - aTime;
            });

        if (!files.length) {
            console.error(`[ELECTION] getBallots - Error: No ballots file found`);
            return res.status(404).json({ message: "No ballots file found." });
        }

        const latestFile = path.join(outputFolder, files[0]);
        const fileContent = fs.readFileSync(latestFile, 'utf-8');
        const jsonData = JSON.parse(fileContent);

        console.log(`[ELECTION] getBallots - Success: ${files[0]}`);
        return res.status(200).json({
            message: "Ballots file loaded successfully.",
            data: jsonData
        });
    } catch (error) {
        console.error(`[ELECTION] getBallots - Error:`, error);
        return res.status(500).json({ message: "Error fetching ballots file", error });
    }
}