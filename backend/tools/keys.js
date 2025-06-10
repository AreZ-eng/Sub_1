require('dotenv').config();
const { PublicKey } = require('paillier-bigint');

async function encVote(voteArray) {
    const n = process.env.PUB_N;
    const g = process.env.PUB_G;

    if (!n || !g) {
        throw new Error('Kunci publik tidak ditemukan di file .env');
    }

    const publicKey = new PublicKey(BigInt(n), BigInt(g));

    if (!Array.isArray(voteArray)) {
        throw new Error('voteArray harus berupa array.');
    }

    const encryptedArray = await Promise.all(voteArray.map(async (value) => {
        if (typeof value !== 'number' || isNaN(value)) {
            throw new Error('Setiap nilai dalam voteArray harus berupa angka.');
        }
        const val = value === 1 ? 1n : 0n;
        return publicKey.encrypt(val).toString();  // Assuming encrypt returns a BigInt or a Buffer-like object
    }));

    return JSON.stringify(encryptedArray, null, 2);
}

function addEncryptedBallots(encryptedVotes) {
    const n = process.env.PUB_N;
    const g = process.env.PUB_G;

    if (!n || !g) {
        throw new Error('Kunci publik tidak ditemukan di file .env');
    }

    const publicKey = new PublicKey(BigInt(n), BigInt(g));

    if (!Array.isArray(encryptedVotes) || encryptedVotes.length === 0) {
        throw new Error('encryptedVotes harus berupa array dan tidak boleh kosong.');
    }

    // Mengubah vote yang disimpan dalam format string kembali menjadi BigInt
    const parsedVotes = encryptedVotes.map(vote => {
        try {
            // Parsing voteTo yang berisi string terenkripsi dan mengubahnya menjadi BigInt
            return JSON.parse(vote.voteTo).map(encryptedValue => BigInt(encryptedValue));
        } catch (error) {
            throw new Error('Gagal memparsing voteTo: ' + error.message);
        }
    });

    // Agregasi suara terenkripsi menggunakan penjumlahan homomorfik
    const totalEncryptedVotes = parsedVotes.reduce((total, currentVote) => {
        if (!total) return currentVote; // Inisialisasi total jika null

        // Menjumlahkan suara terenkripsi untuk setiap kandidat
        return total.map((encryptedValue, index) =>
            publicKey.addition(encryptedValue, currentVote[index])
        );
    }, null);

    // Mengembalikan hasil penjumlahan homomorfik sebagai array string
    return totalEncryptedVotes.map(value => value.toString()); // Konversi kembali ke string
}

module.exports = { encVote, addEncryptedBallots };
