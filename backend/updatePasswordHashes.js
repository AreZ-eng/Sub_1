const bcrypt = require('bcrypt');

async function updatePasswordHashes() {
    console.log('Starting password hash generation...\n');
    
    // Daftar password yang perlu di-hash
    const passwordUpdates = [
        { nama: 'John Doe', password: 'TICKET123' },
        { nama: 'Jane Smith', password: 'TICKET456' },
        { nama: 'Alice Johnson', password: 'TICKET789' },
        { nama: 'Bob Brown', password: 'TICKET101' },
        { nama: 'Charlie Green', password: 'TICKET102' },
        // { nama: 'admin', password: 'admin' },
    ];

    for (const update of passwordUpdates) {
        const hashedPassword = bcrypt.hashSync(update.password, 12);
        console.log(`${update.nama} | Plain: ${update.password} | Hash: ${hashedPassword}`);
    }

    console.log('\nPassword hash generation completed!');
}

if (require.main === module) {
    updatePasswordHashes();
}

module.exports = { updatePasswordHashes };
