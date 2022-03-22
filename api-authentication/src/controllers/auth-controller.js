const mysql = require('../database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.json');
const encrypt = require('../utils/encrypt');
const crypto = require('crypto');

exports.verifyEmail = (req, res) => {
    const { email } = req.body;
    mysql.getConnection((error, conn) => {
        conn.query(
            `SELECT usuarios.email
                FROM usuarios
                    WHERE usuarios.email = ?;
            `,
            [email],
            (error, result, field) => {
                conn.release();

                if (error)
                    res.status(500).json({
                        error: "Ops...ocorreu um erro interno, tente novamente."
                    });

                if (result.length > 0)
                    res.status(200).json({
                        isRegistered: true,
                        message: "Este e-mail já foi cadastrado, tente outro..."
                    });
                else
                    res.status(200).json({
                        isRegistered: false
                    });
            }
        );
    });
}

exports.verifyToken = (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader)
        res.status(401).json({
            error: 'No token provided'
        });

    const parts = authHeader.split(' ');

    if (!parts.length === 2)
        res.status(401).json({
            error: 'Token error'
        });


    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme))
        res.status(401).json({
            error: 'Token malformatted'
        });

    jwt.verify(token, authConfig.secret, (error, decoded) => {
        if (error)
            res.status(401).json({
                error: error
            });

        req.userId = decoded.id;
        res.status(200).json({
            userId: decoded.id
        });
    });
};

exports.register = async (req, res) => {
    let user = req.body;
    try {
        user.senha ? user.senha = await encrypt.generateHash(user.senha, 10) : user.senha = crypto.randomBytes(80).toString('hex');
        mysql.getConnection((error, conn) => {
            conn.query(
                `INSERT INTO 
                    usuarios(
                        id_tipo_usuario,
                        nome,                                                
                        cpf,
                        senha                        
                    )
                    VALUES (?, ?, ?, ?);
                    `,
                [
                    user.idTipoUsuario,
                    user.nome,
                    user.cpf,
                    user.senha,
                ],
                (error, result, field) => {
                    conn.release();

                    if (error)
                        res.status(500).json({
                            error: "Ops...ocorreu um erro interno, tente novamente."
                        });

                    user.senha = undefined;
                    res.status(201).send({ user });
                }
            );
        });
    } catch (error) {
        res.status(400).json({
            error: "Ops...ocorreu um erro interno, tente novamente."
        })
    }
}

exports.authenticate = async (req, res) => {
    const { cpf, senha } = req.body;
    mysql.getConnection((error, conn) => {
        conn.query(
            `SELECT 
                usuarios.cpf, 
                usuarios.senha
            FROM usuarios
                WHERE
                    usuarios.cpf = ?;
            `, cpf,
            (error, result, field) => {
                conn.release();

                if (error)
                    res.status(400).json({
                        error: error
                    });

                if (!result.length > 0)
                    res.status(400).json({
                        message: "Cpf ou senha inválido!"
                    });

                if (result.length > 0)
                    bcrypt.compare(senha, result[0].senha,
                        (error, result) => {

                            if (error)
                                res.status(400).json({
                                    error: error
                                });

                            if (result) {
                                mysql.getConnection((error, conn) => {
                                    conn.query(
                                        `SELECT 
                                            usuarios.id_usuario,
                                            usuarios.id_tipo_usuario                                         
                                        FROM usuarios
                                            WHERE
                                                usuarios.cpf = ?;
                                        `, cpf,
                                        (error, result, field) => {
                                            conn.release();

                                            if (error)
                                                res.status(400).json({
                                                    error: error
                                                });

                                            const token = jwt.sign({ id: result[0].id_usuario }, authConfig.secret, {
                                                expiresIn: 86400
                                            });

                                            res.status(200).json({
                                                user: result[0],
                                                token: token
                                            });
                                        }
                                    );
                                })
                            } else {
                                res.status(401).json({
                                    message: "Cpf ou senha inválido!"
                                });
                            }
                        });
            }
        );
    });
}