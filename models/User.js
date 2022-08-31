const mongoose = require('mongoose')
const crypto = require('crypto')
// const uuidv1 = require('uuid/v1') 
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        maxlength:32
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique:true
    },
    hashed_password: {
        type: String,
        required: true
    },
    about: {
        type:String,
        trim:true
    },
    salt:String,

    //admin or user
    role: {
        type:Number,
        default:0
    },

    //orders placed items purchased
    history: {
        type:Array,
        default: []
    }
},{timestamps:true});

// virtual field
// But to ensure two users don't end up with the same hashed 
// password if they happen to use the same password text, 
// we pair each password with a unique salt value before 
// generating the hashed password for each user.
userSchema.virtual('password')
.set(function(password) {
    this._password = password
    this.salt = uuidv4();
    this.hashed_password = this.encryptPassword(password)
})
.get(function() {
    return this._password
})

userSchema.methods = {

    authenticate:function(plainText)
    {
       return this.encryptPassword(plainText) === this.hashed_password;
    },

    encryptPassword: function(password) {
        if(!password) return '';
        try {
            return crypto.createHmac('sha1', this.salt)
                             //to add salt to password
                             .update(password)
                             .digest('hex')
        } catch (err) {
            return "";
        }
    }
};

module.exports = mongoose.model("User", userSchema);