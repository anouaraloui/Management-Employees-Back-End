import nodemailer from "nodemailer"

const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "managementemployees1@gmail.com",
        pass: "mdbtpmtwhwscwamy"
    }   
})

const confirmationAccount = (email, plainPassword) => {
    transport.sendMail({
        from: "managementemployees1@gmail.com",
        to: email,
        subject: "Welcome to our company ",
        html: `<div>
        <h1>Welcome to our company </h1>
        <h2>Hello<h2>
        <p>To can enter in our company, please enter this email and this password :<p>
        <p> email: ${email}<p>
        <p> password: ${plainPassword}<p>
        `
    }) 
    .catch((err) => console.log(err));
}

const sendForgotPassword= (email,userId, token) => {
    transport.sendMail({
        from: "managementemployees1@gmail.com",
        to: email,
        subject: "Password Reset!",
        html: `<div>
        <h1>Password Reset!</h1>
        <h2>Hello<h2>
        <p>To reset your password, please click on the link<p>
        <a href=http://localhost:8000/reset-password/${userId}/${token}>Click here! </a>
        </div>
        `
    })
    .catch((err) => console.log(err));
}
export  {  confirmationAccount, sendForgotPassword };