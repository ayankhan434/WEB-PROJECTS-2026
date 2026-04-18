
function openfeatures(){
var allElems= document.querySelectorAll('.elem')
var allFullElems = document.querySelectorAll('.fullElem')
var allFullElemsBackBtn= document.querySelectorAll('.fullElem .back')

allElems.forEach(function(elem){
    elem.addEventListener('click',function(){
      /*   console.log(elem.id) */
      allFullElems[elem.id].style.display='block'

    })

})

allFullElemsBackBtn.forEach(function(back){
    /* console.log('back btn') */
    back.addEventListener('click',function(){
        console.log(back.id)
        allFullElems[back.id].style.display='none'
    })
})
}
openfeatures()

let form = document.querySelector('.addtask form')
let taskInput = document.querySelector('.addtask form #task-input')
let taskdetailsInput = document.querySelector('.addtask form textarea')
let taskCheckbox = document.querySelector('.addtask form #check')

let currentTask=[
    {
        task:'coading',
        details:'details of coading',
        imp:false
    },
   {
        task:'engineering maths',
        details:'details of engineering maths',
        imp:false
   },
   {
        task:'revision',
        details:'math and coading revision',
        imp:true
   }
]


 
 


function renderTask(){  
var allTask = document.querySelector('.alltask')

var sum= ''

currentTask.forEach(function(elem){
    sum+=`  <div class="task">
              
         
              <h5>${elem.task}<span class=${elem.imp ? 'true' : 'false'}>imp</span></h5>
              <button>mark as completed</button>
           
           
            

          </div>`
    // console.log(elem)
})

// console.log(sum);

allTask.innerHTML = sum 
}
renderTask()



 console.log(form)
 form.addEventListener('submit',function(e){
    e.preventDefault()


     //console.log('form submitted')
    console.log(taskInput.value)
    console.log(taskdetailsInput.value)
    console.log(taskCheckbox.checked) 

    currentTask.push({
        task:taskInput.value,
        details:taskdetailsInput.value,
        imp:taskCheckbox.checked
    })
    taskInput.value=''
    taskdetailsInput.value=''
    taskCheckbox.checked=false
 // console.log(currentTask)
  renderTask()
} ) 