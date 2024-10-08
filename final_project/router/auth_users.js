const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    for (const user of users){
        if (user.username === username){
            return true;
        }
    }

    return false;
}

const authenticatedUser = (username,password)=>{ //returns boolean

    for (const user of users){
        if (user.username === username && user.password === password){
            return true;
        }
    }

    return false;

}

//only registered users can login
regd_users.post("/login", (req,res) => {

    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password){
        return res.status(404).json({message: "Please enter a value for both username and password"});
    }

    if (!authenticatedUser(username,password)){
        return res.status(404).json({message: "Invalid username or password"});
    }

    let accessToken = jwt.sign({
        data: password 
    }, 'access', {expiresIn: 60 * 60});

    req.session.authorization = {
        accessToken, username
    }

    return res.status(200).json({message: "User logged in"}); 

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {

    const isbn = parseInt(req.params.isbn);
    const review = req.body.review;
    const user = req.session.authorization['username']

    books[isbn].reviews[user] = review;

    return res.status(300).json({message: `${user} your review has been added/ updated`});
});

regd_users.delete("/auth/review/:isbn", (req, res) => {

    const isbn = parseInt(req.params.isbn);
    const user = req.session.authorization['username']

    delete books[isbn].reviews[user];

    return res.status(300).json({message: `${user} your review has been deleted`});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
