'use strict';

var bcrypt = require('bcrypt');

module.exports = function(sequelize, DataTypes) {

    var user = sequelize.define("user", {
        email: {
            type: DataTypes.STRING,
            validate: {
                isEmail:{
                    args:[true],
                    msg: "Sorry, we don't recognize that e-mail address format."
            }
        }
        },
        password: {
            type: DataTypes.STRING,
            validate: {
                notEmpty:{
                    args:[true],
                    msg:"Password can't be blank."
                },
                len:{
                    args:[5],
                    msg:'Password must be at least 5 characters long.'
                }
            }
        },
        name: {
            type: DataTypes.STRING,
            validate: {
                notEmpty:{
                    args:[true],
                    msg:"Name can't be blank."
                }
            }
        },
        score: { type: DataTypes.INTEGER, defaultValue: 0 }
    }, {
        classMethods: {
            associate: function(models) {
                // associations can be defined here
                
                models.user.hasMany(models.post);
                models.user.hasMany(models.vote);
                models.user.hasMany(models.message);
                models.user.belongsToMany(models.post, {through: "usersForPosts", as: "postsFor"});
                models.user.belongsToMany(models.post, {through: "usersAgainstPosts", as: "postsAgainst"});
            },
            authenticate: function(email,password,callback)
            {
                this.find({where:{email:email}}).then(function(user){
                    if(user){
                        bcrypt.compare(password,user.password,function(err,result){
                            if(err){
                                callback(err);
                            }else{
                                callback(null, result ? user : false);
                            }
                        });
                    }else{
                        callback(null, false);
                    }
                }).catch(callback);
            }
        },
        hooks: {
            beforeCreate: function(user, options, callback){
                if(user.password){
                    bcrypt.hash(user.password,5,function(err,hash){
                        if(err) return callback(err);
                        user.password = hash;
                        callback(null, user);
                    });
                }else{
                    callback(null, user);
                }
            },
            beforeUpdate: function(user, options, callback) {
                if(user.password){
                    bcrypt.hash(user.password,5,function(err,hash){
                        if(err) return callback(err);
                        user.password = hash;
                        callback(null, user);
                    });
                }else{
                    callback(null, user);
                }
            }
        }
    });

    return user;
};
