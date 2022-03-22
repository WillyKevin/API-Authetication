const bcrypt = require('bcryptjs');

exports.generateHash = async(param, stregth) => {
    const hash = await bcrypt.hash(param, stregth);
    return hash;
}