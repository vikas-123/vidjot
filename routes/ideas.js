const express =require('express');
const router = express.Router();
const mongoose = require('mongoose');

//load helper

const {ensureAuthenticated} =require('../helper/auth');
//load the schema
require('../models/idea');
 const Idea = mongoose.model('ideas');


module.exports = router;


router.get('/',ensureAuthenticated,(req,res)=>{
	Idea.find({user:req.user.id})
	.sort({date:'desc'})
	.then(ideas=>{
		res.render('ideas/index' ,{
			ideas:ideas
		});
	})
	
}); 

// add ideas

router.get('/add',ensureAuthenticated, (req,res)=>{
	res.render('ideas/add');
});

//edit ideas
router.get('/edit/:id',ensureAuthenticated, (req,res)=>{
	Idea.findOne({
		_id:req.params.id
	})
	.then(idea => {
		if (idea.user!=req.user.id)
		 {
		 	req.flash('error_msg','Not Authorized to access others courses');
		 	res.redirect('/ideas');
		 }
		else
		{
			res.render('ideas/edit',{
			idea:idea
		});
		}
	});
});

router.post('/',ensureAuthenticated,(req,res)=>{
	let errors = [];

	if (!req.body.title) {
		errors.push({text:'Please add a title'});
	}

	if (!req.body.details) {
		errors.push({text:'Please add a details'});
	}

	if(errors.length>0)
	{
		res.render('ideas/add',{
			errors:errors,
			title:req.body.title,
			details:req.body.details
		});
	}

	else
	{const newUser = {
		title:req.body.title,
		details:req.body.details,
		user:req.user.id
	}
	new Idea(newUser)
	.save()
	.then(idea=> {
		req.flash('success_msg','video idea added')
		res.redirect('/ideas');
	})
	}
});

//edit form process
router.put('/:id',ensureAuthenticated, (req,res) =>
{
	Idea.findOne({
		_id:req.params.id
	})
	.then(idea => {
		idea.title=req.body.title;
		idea.details=req.body.details;
		idea.save()
		.then(idea => {
			req.flash('success_msg','video idea updated')
			res.redirect('/ideas');
		})
	});
}); 

router.delete('/:id', ensureAuthenticated,(req,res)=>{
	Idea.remove({_id:req.params.id})
	.then(()=>{
		req.flash('success_msg','video idea removed');
		res.redirect('/ideas');
	});
});