function videoconanimation() {
    var videocon = document.querySelector("#video-container")
    var playbtn = document.querySelector("#play")
    videocon.addEventListener("mouseenter", function () {
        gsap.to(playbtn, {
            alert: "Mouse Entered",
            opacity: 1,
            scale: 1,

        })
    })
    videocon.addEventListener("mouseleave", function () {
        gsap.to(playbtn, {
            opacity: 0,
            scale: 0,
        })
    })


    videocon.addEventListener("mousemove", function (dets) {
        gsap.to(playbtn, {
            x: dets.x - 50,
            y: dets.y - 500,
        })
    })
}
videoconanimation()

function loadinganimation() {
    gsap.from("#page1 h1", {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.3,
        delay: 0.5
    })
}
loadinganimation()

const scroll = new LocomotiveScroll({
    el: document.querySelector("#main"),
    smooth: true
});