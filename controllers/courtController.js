const mongoose = require('mongoose');
const Court = mongoose.model('Court');


exports.homePage = (req, res) => {
    
    res.render('index')
}

exports.addCourt = (req, res) => {
    res.render('editCourt', {title: 'Add Court'})
};

exports.createCourt = async (req, res) => {
    const court = await (new Court(req.body)).save();
    req.flash('success', `Successfully Created ${court.docket}.`)
    res.redirect(`/court/${court.slug}`);
};

exports.getCourts = async (req, res) => {
    //Query the database for list of cases
    const courts = await Court.find();
    res.render('courts', { title: 'Courts', courts})
}

exports.editCourt = async (req, res) => {
    //1 find the court given the id
    const court = await Court.findOne({ _id: req.params.id })
    //2 confirm they own the store - I'll do this later
    //Render out the edit form so the user can update their store
    res.render('editCourt', { title: `Edit ${court.court}`, court })

}

exports.updateCourt = async (req, res) => {
    // Set the location of the data to be a point
    req.body.location.type = 'Point';
    //Find and update the store
    const court = await Court.findOneAndUpdate({ _id: req.params.id}, req.body, {
        new: true, //return the new case instead of the old one
        runValidators: true
    }).exec();
    //Redirect them to the case and tell them it worked
    req.flash('success', `Successfully updated <strong>${court.court}</strong>. <a href="/courts/${court.slug}"> View Store ➡️</a>`)
    res.redirect(`/courts/${court._id}/edit`);
    
}