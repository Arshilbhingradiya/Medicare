const {Schema, model, mongoose  } = require("mongoose");

const contactSchema = new Schema({
    username: {
        type: "String",
        require:true,
    },
    email: {
        type: "String",
        require:true,
    },
    message: {
        type: "String",
        require:true,
    },
})

const Contact = new model("contactform" , contactSchema);
module.exports = Contact;