const Administrador = require("../models/").Administrador;
const Usuario = require("../models/").Usuario;
const bcrypt = require("bcryptjs");

const index =  async(req,res) =>{
    const allAdmin = await Administrador.findAll({
        include:{
            model: Usuario,
            attributes:['id','email','ativo']
        }     
    });
    return res.json(allAdmin);
}

const store = async (req,res)=>{
    try{
        const {email,password,nome} =  req.body;
        const ativo = true;
        const tipo = 3;
        const userExists = await Usuario.findOne({where:{email}});
        if(userExists){
            return res.json({message:"Email já existe!"});
        }
        const senha = await bcrypt.hash(password,8);
        const user = await Usuario.create({email,senha,tipo,ativo}); 
        const admin = await Administrador.create({id_usuario:user.id,nome});
        const response = {
            message:'Administrador cadastrado com sucesso!',
            admin
        }
        return res.json(response);
    }catch(err){
        return res.json(err.message);
    }
}

const update = async (req,res) => {
    try{
        const {email,nome,ativo} = req.body;
        const admin = await Usuario.findOne({where:{email}});
        if(!admin){
            return res.json({message:"Usuário não encontrado!"});
        }
        const resultupdt = await admin.update({email,ativo});
        const resultAdmin = await Administrador.findOne({where:{id_usuario:resultupdt.id}});
        await resultAdmin.update({nome});
        return res.json({message:"Administrador Atualizado"});
    }catch(err){
        return res.json(err);
    }
}

const updatePassword = async (req,res) =>{
    const {email,password} =  req.body;
    const user = await Usuario.findOne({where:{email}});
    const senha = await bcrypt.hash(password,8);
    await user.update({senha});
    return res.send({message:"Senha Atualizada!"});
}

const remove = async (req,res)=>{
    const {email} = req.body;
    const user = await Usuario.findOne({where:{email}});
    if(!user){
        return res.json({message:"Administrador não encontrado!"});
    }
    if(user.tipo != 3){
        return res.json({message:"Usuário não é um administrador!"})
    }
    if(user.ativo == false){
        return res.json({message:"Administrador já foi removido!"})
    }
    await user.update({ativo:false});
    return res.json({message:"Administrador deletado"});
}

const indexById = async (req,res) =>{
    const {email} =  req.params;
    const admin = await Usuario.findOne({
        where:{email},
        include:{
            model:Administrador
        }
    });  
    if(!admin){
        return res.json({message:"Administrador não encontrado!"});
    }
    const result = {
        Usuario:{
            email:admin.email,
            ativo:admin.ativo
        },
        admin:{
            nome:admin.Administrador.nome
        }
    }
    return res.json(result);
}

module.exports = {
    store,
    update,
    index,
    indexById,
    remove,
    updatePassword
}
