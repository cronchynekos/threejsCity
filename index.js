
import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import {OrbitControls} from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js';
import dat from "https://cdn.skypack.dev/dat.gui";

//datgui setup
const gui = new dat.GUI()
const world = {
    plane: {
        width: 19,
        height: 19,
        widthSegments: 17,
        heightSegments: 17
    }
}
gui.add(world.plane, 'width', 1, 20).onChange(generatePlane)
gui.add(world.plane, 'height', 1, 20).onChange(generatePlane)
gui.add(world.plane, 'widthSegments', 1, 20).onChange(generatePlane)
gui.add(world.plane, 'heightSegments', 1, 20).onChange(generatePlane)

function generatePlane() {
    planeMesh.geometry.dispose()
    planeMesh.geometry = new THREE.PlaneGeometry(
        world.plane.width, 
        world.plane.height, 
        world.plane.widthSegments, 
        world.plane.heightSegments
        )

    const {array} = planeMesh.geometry.attributes.position
    for (let i = 0; i < array.length; i += 3) {
        const x = array[i]
        const y = array[i + 1]
        const z = array[i + 2]
        array[i + 2] = z + Math.random()
    }

    const colors = []
    for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
        colors.push(0, 0.19, 0.4)
    }

    planeMesh.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))

}

//scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer()
renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(devicePixelRatio) //set dpi to device specs
document.body.appendChild(renderer.domElement) //set the canvas to the html body
const raycaster = new THREE.Raycaster() //tells 3js where the mouse is

new OrbitControls(camera, renderer.domElement)
camera.position.z = 5

//material setup
const planeGeometry = new THREE.PlaneGeometry(
    world.plane.width, 
    world.plane.height, 
    world.plane.widthSegments, 
    world.plane.heightSegments
    )
const planeMaterial = new THREE.
    MeshPhongMaterial({
    side: THREE.DoubleSide,
    vertexColors: true
})
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)
planeMesh.material.flatShading = true
scene.add(planeMesh)

//geometry gradient
const {array} = planeMesh.geometry.attributes.position
const randomValues = [] //for random vertice movement
for (let i = 0; i < array.length; i += 3) {
    const x = array[i]
    const y = array[i + 1]
    const z = array[i + 2]
    array[i] = x + (Math.random() - 0.5)
    array[i + 1] = y + (Math.random() - 0.5)
    array[i + 2] = z + Math.random()

    randomValues.push(Math.random() - 0.5)
}

planeMesh.geometry.attributes.position.randomValues = randomValues

planeMesh.geometry.attributes.position.originalPosition = 
    planeMesh.geometry.attributes.position.array

console.log(planeMesh.geometry.attributes.position)

//initial color
const colors = []
for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
    colors.push(0, 0.19, 0.4)
}

planeMesh.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))

//light setup
const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(0, 0, 1)
scene.add(light)

const backlight = new THREE.DirectionalLight(0xffffff, 1)
backlight.position.set(0, 0, -1)
scene.add(backlight)

//define mouse for coordinates
const mouse = {
    x: undefined,
    y: undefined
}


let frame = 0

//animate
function animate() {
    requestAnimationFrame(animate)
    frame += 0.01
    renderer.render(scene, camera)
    raycaster.setFromCamera(mouse, camera)

    const { array, originalPosition, randomValues } = planeMesh.geometry.attributes.position
    for (let i = 0; i < array.length; i+=3) {
        array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.01

    }

    planeMesh.geometry.attributes.position.needsUpdate = true



    const intersects = raycaster.intersectObject(planeMesh)
    if (intersects.length > 0) {

        const {color} = intersects[0].object.geometry.attributes

        //vertice 1
        color.setX(intersects[0].face.a, 0.1)
        color.setY(intersects[0].face.a, 0.5)
        color.setZ(intersects[0].face.a, 1)

        //vertice 2
        color.setX(intersects[0].face.b, 0.1)
        color.setY(intersects[0].face.b, 0.5)
        color.setZ(intersects[0].face.b, 1)

        //vertice 3
        color.setX(intersects[0].face.c, 0.1)
        color.setY(intersects[0].face.c, 0.5)
        color.setZ(intersects[0].face.c, 1)
        intersects[0].object.geometry.attributes.color.needsUpdate = true

        const initialColor = {
            r: 0,
            g: .19,
            b: .4
        }
        const hoverColor = {
            r: 0.1,
            g: .5,
            b: 1
        }

        gsap.to(hoverColor, {
            r: initialColor.r,
            g: initialColor.g,
            b: initialColor.b,
            onUpdate: () => {
                color.setX(intersects[0].face.a, hoverColor.r)
                color.setY(intersects[0].face.a, hoverColor.g)
                color.setZ(intersects[0].face.a, hoverColor.b)

                //vertice 2
                color.setX(intersects[0].face.b, hoverColor.r)
                color.setY(intersects[0].face.b, hoverColor.g)
                color.setZ(intersects[0].face.b, hoverColor.b)

                //vertice 3
                color.setX(intersects[0].face.c, hoverColor.r)
                color.setY(intersects[0].face.c, hoverColor.g)
                color.setZ(intersects[0].face.c, hoverColor.b)
            }
        })
    }
}

animate()


addEventListener('mousemove', () => {
     mouse.x = (event.clientX / innerWidth) * 2 - 1
     mouse.y = -(event.clientY / innerHeight) * 2 + 1
})