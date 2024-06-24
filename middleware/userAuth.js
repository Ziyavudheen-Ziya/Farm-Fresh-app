

module.exports = async (req, res, next) => {

    try {

        if (req.session.user) {

            next()
        } else {

            res.redirect('/loginpage')
        }

    } catch (error) {
        console.log(error.message);
        res.redirect('/loginpage')

    }


}