const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const courtSchema = new mongoose.Schema({
court: {
    type: String,
    trim: true,
    required: 'Please Enter a Court House'
},
slug: String,
defendant: {
    type: String,
    trim: true,
    required: 'Please Provide a Defendant Name'
}, 
docketNumber: {
    type: String,
    trim: true,
    required: 'Please Provide a docket number'
},
date: {
    type: String,
    required: 'Please Enter a date'
},
time: {
    type: String,
    trim: true,
    required: 'Please enter court time'
},
department: {
    type: String,
    trim: true
},
officer: {
    type: String,
    trim: true
},
phoneNumbers: {
    type: String,
    validate: {
      validator: function(v) {
        return /\d{3}-\d{3}-\d{4}/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    },
    required: [true, 'User phone number required']
  },
tags: [String],
created: {
    type: Date,
    default: Date.now
},
location: {
    type: {
      type: String,
      default: 'Point'
},
coordinates: [{
    type: Number,
    required: 'You Must Supply Coordinates'
}],
address: {
    type: String,
    required: 'You must supply an address'
}
},
photo: String,
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply an author'
  }
});

//define our index
courtSchema.index({
    court: 'text',
    docketNumber: 'text',
    officer: 'text'
});

courtSchema.index({ location: '2dsphere' });

courtSchema.pre('save', async function(next) {
    if(!this.isModified('docketNumber')) {
        next(); //skip it
        return;  //Stop this function from running
    }
    this.slug = slug(this.docketNumber)
    //Find other slugs that have a similar slugs and rename [0, 1, 2, 3, 4, etc...]
    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    const courtsWithSlug = await this.constructor.find({ slug: slugRegEx });
    if(courtsWithSlug.length) {
        this.slug = `${this.slug}-${courtsWithSlug.length + 1}`
    }

    next();

    //ToDo make slugs more resilient so we don't have duplicate docket # slugs in the future
})

module.exports = mongoose.model('Court', courtSchema)