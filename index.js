const express = require("express");
// require("./src/db/conn");
require('dotenv').config();

const mongoose = require('mongoose');

const multer = require('multer');
const jwt = require('jsonwebtoken');
const app = express();
const path = require('path');
const User = require("./src/models/users");
const Image = require("./src/models/images");
const Categories = require("./src/models/categories");
const About = require("./src/models/about");
const Contact = require("./src/models/contact");

const PORT = process.env.PORT || 8000;
mongoose.set('strictQuery', false);

app.use(express.json());
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}
// BASEURL="http://localhost:8000";





// Path to your src folder containing images
const publicFolderPath = path.join(__dirname, 'src'); 
app.use(express.static(publicFolderPath));



/////////////////upload image storage path or destination////////////////////////



const storage = multer.diskStorage({
  destination: './src/uploads/profilepics/',
  filename: function (req, file, cb) {
    cb(null, path.basename(file.originalname));
  },
 });
const upload = multer({ storage: storage });



/////////////////////////////////////////////////////////Registration/////////////////////////////////////////////////


app.get('/',function(req,res){
  res.json(
    {
      name:'picgallery',
      disc:"wallpaper app"
    }
  )
});


app.post("/users",upload.single('profileImage'),async(req,res)=>{
    console.log(req.body);
    const{name,email,phone,password}=req.body;
    const profileImage =req.file.filename;
    console.log("cdcvdsvdfvfdv"+req.file.filename);
    const users = new User({name,email,phone,password,profileImage});
    console.log("dsvdsvsdvsd"+users);
    await users.save().then(()=>{
        res.send("success")
    }).catch((e)=>{
        res.send("failed")
    })
});



////////////////////////////////////////////////////login////////////////////////////////////////////////////



app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({email});

    if (!user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id, name: user.name,email: user.email, phone: user.phone, password: user.password,profileImage: user.profileImage}, 'asdfghjkl', {
      expiresIn: '10000h',
    });

    res.status(200).json({ token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



////////////////////////////////retrieve all users//////////////////////////////

app.get("/users",async(req,res)=>{
    try {
        const user = await User.find();
        res.json(user);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
});




///////////////////////////////////update profile///////////////////////////////////////////////////////////////////

app.patch('/users/:id',upload.single('profileImage'), async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedFields = req.body;
    if (req.file) {
      updatedFields.profileImage = req.file.filename; // Save the filename in the database
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updatedFields,
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const token = jwt.sign({updatedUser,}, 'asdfghjkl', {
      expiresIn: '10000h',
    });

    res.status(200).json({ token });
  } catch (err) {
    console.error('Error updating user:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});







////////////////////////////////////////save categories by userid/////////////////////////

app.post("/categories/:userId",upload.single('image'),async(req,res)=>{
  console.log(req.body);
  const userId = req.params.userId;


  const{name}=req.body;
  const image =req.file.filename;
  console.log("cdcvdsvdfvfdv"+req.file.filename);
  const images = new Categories({name,userId,image});
  console.log("dsvdsvsdvsd"+images);
  await images.save().then(()=>{
      res.send("success")
  }).catch((e)=>{
      res.send("failed")
  })
});




///////////////////////////////get all the categories  by userid/////////////////////////

app.get("/categories/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const categories = await Categories.find({ userId });

    if (categories.length === 0) {
      return res.status(404).json({ message: 'No categories found for the user' });
    }

    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});





////////////////////////////get alll the images from allll users//////////////

app.get('/images', async (req, res) => {
  try {
      const imagess = await Image.find();
      const allImages = imagess.reduce((images, imagess) => {
        return images.concat(imagess.images);
      }, []);
    res.status(200).json(allImages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});



///////////////////////////////////////////////////////////update image using userid and collection name////////////////////////////////////

app.patch('/images/:userId/:category', upload.array('images', 100), async (req, res) => {
  const { userId, category } = req.params;
  const files = req.files;

  try {
    const imagePaths = files.map(file => file.filename);

    // Find the existing Image document for the given userId and category
    let existingImage = await Image.findOne({ userId, category });

    if (!existingImage) {
      // If no record exists, create a new one with the uploaded images
      const newImage = new Image({
        userId: userId,
        category: category,
        images: imagePaths,
      });

      await newImage.save();
    } else {
      // If a record exists, append the new image paths to the existing record
      existingImage.images.push(...imagePaths);
      await existingImage.save();
    }

    res.status(201).json({ message: 'Images uploaded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});




////////////////////////////////////////get all the userid & category wise images //////////////////////
app.get('/images/:userId/:category', async (req, res) => {
  const { userId, category } = req.params;

  try {
    if (!userId || !category) {
      return res.status(400).json({ message: 'User ID and category are required' });
    }

    const images = await Image.find({ userId, category });

    res.status(200).json(images);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



//////////////////////get all the images of a user/////////////////////////////

app.get('/images/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const images = await Image.find({ userId });

    const imageInfo = images.reduce((info, image) => {
      image.images.forEach(imageName => {
        info.push({ category: image.category, imageName });
      });
      return info;
    }, []);

    res.status(200).json(imageInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// app.listen(port,()=>{
//     console.log('connection ins on : '+port);

// });


app.delete('/images/:userId/:imageName', async (req, res) => {
  const { userId, imageName } = req.params;

  try {
    const userImages = await Image.findOne({ userId });

    if (!userImages) {
      return res.status(404).json({ message: 'User not found' });
    }

    const imagesToDelete = userImages.images.filter(imgName => imgName !== imageName);

    userImages.images = imagesToDelete;

    await userImages.save();

    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});









//////////////////////////delete images////////////////

app.delete('/images/:userId/:imageName', async (req, res) => {
  const { userId, imageName } = req.params;

  try {
    const image = await Image.findOne({ userId });

    if (!image) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the image by name and remove it
    const imageToRemoveIndex = image.images.findIndex(imgName => imgName === imageName);

    if (imageToRemoveIndex === -1) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Remove the image name from the array
    image.images.splice(imageToRemoveIndex, 1);

    // Save the updated image data
    await image.save();

    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



/////////////////////////////////////delted images collection wise////////////////////////////
app.delete('/images/:userId/:category/:imageName', async (req, res) => {
  const { userId, category, imageName } = req.params;

  try {
    if (!userId || !category || !imageName) {
      return res.status(400).json({ message: 'User ID, category, and image name are required' });
    }

    const image = await Image.findOne({ userId, category });

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    const imageIndex = image.images.findIndex(img => img === imageName);

    if (imageIndex === -1) {
      return res.status(404).json({ message: 'Image not found in the category' });
    }

    // Remove the image from the category's images array
    image.images.splice(imageIndex, 1);

    // Save the updated image data
    await image.save();

    res.status(200).json({ message: 'Image deleted from the category successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});








/////////////////////////////////////////////////create About details//


app.post('/about', async (req, res) => {
  const { title, discription } = req.body;

  try {
    const newAbout = new About({
      title,
      discription,
    });

    await newAbout.save();

    res.status(201).json({ message: 'About entry created successfully', about: newAbout });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/about', async (req, res) => {
  try {
    const abouts = await About.find(); // Assuming you have a Contact model defined
    
    res.status(200).json({ abouts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});





/////////////////////////////////////////////////create Contact us details//


app.post('/contact', async (req, res) => {
  const {title,email,phone,github,facebook,LinkdIn,Instagram,YouTube,Thread,Twitter,discription } = req.body;
  
  try {
    const newContact = new Contact({
      title,
      email,
      phone,
      github,
      facebook,
      LinkdIn,
      Instagram,
      YouTube,
      Thread,
      Twitter,
      discription 
    });

    await newContact.save();

    res.status(201).json({ message: 'About entry created successfully', contact: newContact });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/contact', async (req, res) => {
  try {
    const contacts = await Contact.find(); // Assuming you have a Contact model defined
    
    res.status(200).json({ contacts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

connectDB().then(() => {
  app.listen(PORT, () => {
      console.log("listening for requests");
  })
})
