
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

console.log(form)
form.addEventListener('submit',function(e){
    e.preventDefault()
    console.log('form submitted')
})