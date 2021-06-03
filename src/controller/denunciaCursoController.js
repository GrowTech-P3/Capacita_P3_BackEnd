const Curso         = require('../models').Curso
const Instituicao   = require('../models').Instituicao
const Denuncia      = require('../models').Denuncias
const Usuario_pcd   = require('../models').Usuario_pcd

const { Op }    = require('sequelize')

exports.listAll = async (req, res) => {
    const denuncias = await Denuncia.findAll({
        include: [
            { model: Curso, include: [
                {model: Instituicao}
            ]},
            { model: Usuario_pcd }
        ]
    })

    return res.send(denuncias);
    
}

exports.listAllOpen = async (req, res) => {
    const denuncias = await Denuncia.findAll({
        where: {aberto: true},
        include: [
            { model: Curso, include: [
                {model: Instituicao}
            ]},
            { model: Usuario_pcd }
        ]
    })

    res.send(denuncias)
}

//CRIA DENUNCIA E DEFINE RELACIONAMENTO COM CURSO
exports.defineOne = async (req, res) => {
    const {id_usuario_pcd, id_curso, descricao} = req.body
    

    try {
        const denuncia = await Denuncia.create({
            id_usuario_pcd,
            descricao,
            data: new Date(),
            aberto: true
        })
    
        const cursoLocalizado = await Curso.findOne({
            where: {id: id_curso}
        })
    
        await denuncia.addCurso(cursoLocalizado)
    
        const resultadoDenuncia = await Denuncia.findOne({
            where: {id: denuncia.id},
            include: [
                { model: Curso, include: [
                    {model: Instituicao}
                ]},
                { model: Usuario_pcd }
            ]
        })

        res.send(resultadoDenuncia)

    } catch (err) {
        console.log(err)
        res.send(err)
    }
}

//FILTRO PESQUISAR POR DENUNCIAS (NOME DO CURSO, INSTITUICAO E DATA)
exports.searchAll = async (req, res) => {
    const {nome_instituicao, nome_curso, dataInicial, dataFinal} = req.body
    await Denuncia.findAll ({
        where: {
            [Op.and]: [
                {data: {[Op.between] : [dataInicial, dataFinal]}},
                {aberto: true}
            ] 
        },
        include:[
            { 
                model: Curso, where: {nome_curso: {[Op.substring]: nome_curso}}, include: [
                    {model: Instituicao, where: {nome: {[Op.substring]: nome_instituicao}}}
                ]
            },
            { model: Usuario_pcd}
        ] 
    }).then(denuncia => {
        res.send(denuncia)
    }).catch(err => {
        console.log(err)
        res.send(err)
    })
}
