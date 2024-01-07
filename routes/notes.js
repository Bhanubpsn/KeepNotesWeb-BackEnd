const express = require('express');
const router = express.Router()
const Notes = require('../models/Notes');
const { body, validationResult } = require('express-validator');
const fetchuser = require('../middleware/fetchuser');

//GET all the notes /api/notes/fetchallnotes
router.get('/fetchallnotes',fetchuser,async(req,res)=>{
    const notes = await Notes.find({user: req.user.id});
    res.json(notes)
})

//POST request to add notes /api/notes/addnote
router.post('/addnote',fetchuser,[
    body('title', 'Enter a valid title').isLength({ min: 3}),
    body('description', 'Enter a valid description').isLength({ min: 5}),
],async(req,res)=>{
    const {title,description,tag} = req.body;

    const erros = validationResult(req);
    if(!erros.isEmpty()){
        res.statusCode = 400;
        return res.send({ errors: erros.array() });
    }

    const note = new Notes({
        title,
        description,
        tag,
        user: req.user.id
    })
    
    const savedNote =  await note.save();


    res.json(savedNote);
})


//PUT for updation of a note of a user /api/notes/updatenote

router.put('/updatenote/:id',fetchuser,async (req,res)=>{
    const {title,description,tag} =  req.body;

    const newNote = {};
    if(title){
        newNote.title = title;
    }
    if(description){
        newNote.description = description;
    }
    if(tag){
        newNote.tag = tag;
    }

    //Find the note to be updated.
    let note = await Notes.findById(req.params.id);
    if(!note){
        return res.status(404).send("Not Found :)");
    }
    if(note.user.toString() !== req.user.id){
        return res.status(401).send("Not Allowed!");
    }
    
    note = await Notes.findByIdAndUpdate(req.params.id,{$set: newNote},{new: false});
    res.json({newNote});

})


//DELETE a note of a user /api/notes/deletenode

router.delete('/deletenote/:id',fetchuser,async (req,res)=>{
    //Find the note to be deleted.
    let note = await Notes.findById(req.params.id);
    if(!note){
        return res.status(404).send("Not Found :)");
    }
    if(note.user.toString() !== req.user.id){
        return res.status(401).send("Not Allowed!");
    }
    
    note = await Notes.findByIdAndDelete(req.params.id);
    res.json({"Success": "Note has been  deleted"});

})

module.exports = router