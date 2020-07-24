const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// const slug = require('slugs');

const numberSchema = new mongoose.Schema({
firstName: {
    type: String,
    trim: true,
    required: 'Please Enter a Court House'
},
lastName: {
    type: String,
    trim: true,
    required: 'Please Provide a Defendant Name'
}, 
phoneNumber: {
    type: String,
    trim: true,
    required: 'Please Provide a docket number'
}
});

//define our index
numberSchema.index({
    firstName: 'text',
    lastName: 'text',
    phoneNumber: 'text'
});

// courtSchema.index({ location: '2dsphere' });

// courtSchema.pre('save', async function(next) {
//     if(!this.isModified('docketNumber')) {
//         next(); //skip it
//         return;  //Stop this function from running
//     }
//     this.slug = slug(this.docketNumber)
//     //Find other slugs that have a similar slugs and rename [0, 1, 2, 3, 4, etc...]
//     const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
//     const courtsWithSlug = await this.constructor.find({ slug: slugRegEx });
//     if(courtsWithSlug.length) {
//         this.slug = `${this.slug}-${courtsWithSlug.length + 1}`
//     }

//     next();

//     //ToDo make slugs more resilient so we don't have duplicate docket # slugs in the future
// })

module.exports = mongoose.model('Numbers', numberSchema)