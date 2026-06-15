const mongoose = require('mongoose')
async function mgconnect(){
    try{
        await mongoose.connect('mongodb://mongodb:27017/quannhu');
        console.log('Connect Successfully')
    } catch(err) {
        console.log('Connect Fail')
    }
}

module.exports = {mgconnect}