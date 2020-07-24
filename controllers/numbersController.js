const mongoose = require('mongoose');
const Court = mongoose.model('Court');
// const multer = require('multer')
// const jimp = require('jimp')
// const uuid = require('uuid')
// const multerOptions = {
//     store: multer.memoryStorage(),
//     fileFilter(req, file, next) {
//         const isPhoto = file.mimetype.startsWith('image/')
//         if(isPhoto) {
//             next(null, true);
//         } else {
//             next({ message: 'That filetype isn\'t allowed!'}, false);
//         }
//     }
// };
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = require('twilio')(accountSid, authToken);
// const swal = require('sweetalert');
  


exports.homePage = (req, res) => {
    
    res.render('index')
}

exports.addCourt = (req, res) => {
    res.render('editCourt', {title: 'Add Court'})
};

// exports.upload = multer(multerOptions).single('photo');

// exports.resize = async (req, res, next) => {
//     // check if there is no new file to resize
//     if(!req.file) {
//         next()//Skip to the next middleware
//         return
//     }
//     const extension = req.file.mimetype.split('/')[1];
//     req.body.photo = `${uuid.v4()}.${extension}`;
//     // Time to resize
//     const photo = await jimp.read(req.file.buffer)
//     await photo.resize(800, jimp.AUTO);
//     await photo.write(`./public/uploads/${req.body.photo}`);
//     //Once we have written the photo to the system, keep going!
//     next(); 
// }

exports.createCourt = async (req, res) => {
    req.body.author = req.user._id;
    const court = await (new Court(req.body)).save();
    req.flash('success', `Successfully Created ${court.docket}.`)
    res.redirect(`/court/${court.slug}`);
};

exports.getCourts = async (req, res) => {
    //Query the database for list of cases
    const courts = await Court.find();
    res.render('courts', { title: 'Courts', courts})
}

const confirmOwner = (court, user) => {
    if (!court.author.equals(user._id)) {
    throw Error('You must own a store in order to edit it!');
  }
};

exports.editCourt = async (req, res) => {
    //1 find the court given the id
    const court = await Court.findOne({ _id: req.params.id })
    //2 confirm they own the store 
    confirmOwner(court, req.user)
    //Render out the edit form so the user can update their store
    res.render('editCourt', { title: `Edit ${court.court}`, court })
    //Pass it to the next controller 
    // next();
}



// exports.updateCourt = async (req, res) => {
//     // Set the location of the data to be a point
//     req.body.location.type = 'Point';
//     //Find and update the store
//     const court = await Court.findOneAndUpdate({ _id: req.params.id}, req.body, {
//         new: true, //return the new case instead of the old one
//         runValidators: true
//     }).exec();
//     console.log("INSIDE THE UPDATE FUNC")
//     //Redirect them to the case and tell them it worked
//     req.flash('success', `Successfully updated <strong>${court.court}</strong>. <a href="/court/${court.slug}"> View Case ➡️</a>`)
//     //Redirect to the edited court case
//     res.redirect(`/courts/${court._id}/edit`);
//     //Move to notify Change func
//     const sms = "+1" + court.phoneNumbers.replace(/-|\s/g,"")

//     console.log("It's Working, SMS", sms)
//     client.messages.create({
//      body: `A Case you are scheduled to appear on has been altered.  Please follow the link to find the new details. http://localhost:7777/court/${court.slug} View Case ➡️`,
//      from: '+13305371719',
//      to: sms
//    }).then(message => console.log(message.sid));
    
    
// }

// exports.getCourtBySlug = async (req, res, next) => {
//     const court = await Court.findOne({ slug: req.params.slug}).populate('author');
//     if(!court) return next();
//     res.render('court', { court, title: court.court })
// }

exports.searchCourts = async (req, res) => {
    const courts = await Court.find({
        $text: {
            $search: req.query.q,
        }
    }, 
    {
        score: { $meta: 'textScore' }
    }).sort({
        score: { $meta: 'textScore' }
    }).limit(5);
    // limit to 5 results
    res.json(courts)
}

exports.mapCourts = async (req, res) => {
    const coordinates = [req.query.lng, req.query.lat].map(parseFloat)
    const q = {
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates
                },
                // $maxDistance: 16000 //10 Miles 
            }
        }
    }

    const courts = await Court.find(q).select('slug docketNumber court date photo location address time').limit(10);
    res.json(courts)
}

exports.mapPage = (req, res) => {
    res.render('map', { title: 'Map' });
}