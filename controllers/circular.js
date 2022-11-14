const Circular = require('../models/circular.js');
const User = require('../models/user.js');
const Constant = require('../models/constant.js')
const notify = require('../controllers/push_notification.controllers')
const fs = require('fs');



module.exports.postCircular = async (req, res) => {

    try {
        const result = {
            postedOn: Date.now(),
            title: req.body.title,
            district: req.body.district,
            dept: req.body.dept,
            number: req.body.number,
            filePath: req.file.path.substring(6),
            postedBy: req.session._id
        }
        var userlist;
        if (req.body.district == 'all') {
            userlist = await User.find({ dept: req.body.dept });
            console.log(userlist + "alll")
        }
        // else if (req.body.dept == 'all' || req.body.batch == 'all') {
        //     userlist = await User.find({ $or: [{ department: { $in: req.body.dept } }, { batch: { $in: req.body.de } }] });
        //     console.log(userlist+"any one")
        // }
        else {
            userlist = await User.find({ $and: [{ preference: { $in: req.body.dept } }, { district: { $in: req.body.district } }] });
            console.log(userlist + "none")
        }
        console.log(userlist);
        devices = []
        userlist.forEach((ele) => {
            if (ele.deviceId != '-')
                devices.push(ele.deviceId)
        })

        notify.pushnotify(devices, result.title, "TN | Circular");

        const circular = await new Circular(result);
        await circular.save()
        req.flash('success', 'Circular Posted successfully')
        res.redirect('/');
    } catch (err) {
        console.log(err.message)
    }
}

module.exports.renderCircular = async (req, res) => {



    const department = await Constant.findOne({});
    const user = await User.findOne({ _id: req.session._id })

    var districts = ["Ariyalur", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Salem", "Sivaganga", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"];
    res.render("circular_page/add_circular.ejs", { districts, department, user })


}

module.exports.deleteCircular = async (req, res) => {
    const { id } = req.params
    try {
        console.log(__dirname)
        const path = `${__dirname}/../public/`
        const circular = await Circular.findByIdAndDelete(id)
        path = path + circular.filePath
        fs.unlinkSync(path)
        req.flash('success', 'Circular has been deleted successfully')
        res.redirect('/circular/all/web')
    } catch (error) {
        console.log(error)
    }
}


module.exports.getAllWebCircular = async(req,res)=>{
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const currentDate = new Date().getDate();
    //today timestamp
    const timestamp = [currentYear, currentMonth <= 9 ? '0' + currentMonth : currentMonth, currentDate <= 9 ? '0' + currentDate : currentDate].join('-');
    const today = new Date(timestamp)
    //yesterday timestamp
    const previous = new Date(today.getTime());
    previous.setDate(previous.getDate() - 1);
    const yesterday = previous;
    try {
        //querry

        var yesterdayCircular = await Circular.find({ $and: [{ dept: { $in: req.body.pref } }, { postedOn: { $gte: yesterday, $lt: today } }] })
        yesterdayCircular = yesterdayCircular.sort((a, b) => b.number - a.number);

        var todayCircular = await Circular.find({ postedOn: { $gt: today } })
        var todayCircular = await Circular.find({ $and: [{ dept: { $in: req.body.pref } }, { postedOn: { $gt: today } }] })
        todayCircular = todayCircular.sort((a, b) => b.number - a.number);

        var allCircular = await Circular.find({ $and: [{ dept: { $in: req.body.pref } }, { postedOn: { $lt: yesterday } }] })
        allCircular = allCircular.sort((a, b) => b.number - a.number)

        //seperating according to months for all circular
        monthwise = [{ "title": "January", "data": [] },
        { "title": "February", "data": [] },
        { "title": "March", "data": [] },
        { "title": "April", "data": [] },
        { "title": "May", "data": [] },
        { "title": "June", "data": [] },
        { "title": "July", "data": [] },
        { "title": "August", "data": [] },
        { "title": "September", "data": [] },
        { "title": "October", "data": [] },
        { "title": "November", "data": [] },
        { "title": "December", "data": [] }]
        allCircular.map((ele) => {
            index = ele.postedOn.getMonth()
            monthwise[index].data.push(ele)
        })
        //response api seperation
            res.render('circular_page/view_allcircular', { allCircular, yesterdayCircular, todayCircular, monthwise }) 
    } catch (err) {
        console.log(err)
        res.status(500).json('Something went worng...')
    }
}

module.exports.getAllCircular = async (req, res) => {
    try{
        const {id}=req.params;
        const user=await User.findById(id);
     
        const preference =user.preference;
        const circular=await Circular.find({})
        circular.reverse();
        const preferCircular=await Circular.find({dept :{$in:preference}})
        let object={}
        for(let i=0;i<preference.length;i++){
                object={...object,[preference[i]]:{}}
        }
   
       for(let i of preferCircular){
            for(let key in object){
                if (key==i.dept){
                    object[key]={...object[key],i};
                }
            }
       }

    console.log(object)
        res.status(200).json({circular,object})

    }catch(err){
        res.status(500).send(err.message)
    }
    
}

module.exports.createfolder = async (req, res) => {
    const folderName = './public/circular_pdf/2024';

    try {
        if (!fs.existsSync(folderName)) {
            //  const newacadamic=await Circular.deleteMany({});
            console.log("Folder Created", newacadamic)
            fs.mkdirSync(folderName);
            req.flash('success', "New Acadamic Year Created Successfully,All Data in the Previous Year are Deleted")
            res.redirect('/')
        }
        else {
            req.flash('error', "Folder already Exists")
            res.redirect('/')
        }
    } catch (err) {
        console.error(err);
        req.flash('error', err.message)
        res.redirect('/')
    }
}


