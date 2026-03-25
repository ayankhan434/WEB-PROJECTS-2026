const scroll = new LocomotiveScroll({
    el: document.querySelector('#main'),
    smooth: true
});

var elemc = document.querySelector("#elem-container")
var fixed = document.querySelector("#fixed-images")
elemc.addEventListener("mouseenter", function () {
    fixed.style.display = "block";
})
elemc.addEventListener("mouseleave", function () {
    fixed.style.display = "none";
})

var elems = document.querySelectorAll(".elem")
elems.forEach(function (e) {
    e.addEventListener("mouseenter", function () {

        var img = e.getAttribute("data-image")
        fixed.style.backgroundImage = `url(${img})`
    })
})

gsap.from("#footer-text h1", {
    y: 150,
    opacity: 0,
    stagger: 0.2,
    duration: 1,
    scrollTrigger: {
        trigger: "#footer",
        scroller: "#main",
        start: "top 70%"
    }
})