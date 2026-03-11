const rot=2*Math.PI

const paths = ['../', 'https://thf.onrender.com/', 'https://tankhellfire.github.io/tankhelfire/']
async function importAss(name, asyncFn, verbose=0) {
  for (const path of paths) {
    try {
      return await asyncFn(path)
    } catch (err) {
      if (verbose)
        console.warn(`couldn't import ${name} from ${path}, ${err}`)
    }
  }
  throw `couldn't import ${name}`
}

async function importAll(params) {
  statusCard.textContent = 'importing'

  window.THREE = await importAss('3.js', e => import(e + 'lib/three/build/three.module.min.js'), 1)
}

async function setup(){
  statusCard.textContent = 'setting up'
  
  THREE.Euler.DEFAULT_ORDER = "YXZ"
  // Set up the scene, camera, and renderer
  window.scene = new THREE.Scene();
  window.camera = new THREE.PerspectiveCamera(90,1,0.1,1000);
  // camera.rotation._order='YXZ'

  camera.position.z = 7;

  window.renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });

  document.body.appendChild(renderer.domElement);

  window.updateCanvas = function() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.zoom = Math.min(1, width / height)

    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', updateCanvas);

}

async function buildScene(){
  statusCard.textContent = 'building scene'


  let cubePose = []
  let hash = window.location.hash.substr(1)
  if (hash) {
    if (hash.includes(',')) {
      cubePose = hash.split(';').map(a => a.split(','))
    } else {
      for (let i = 0; i < hash; i++) {
        cubePose.push([2 * Math.random() - 1, 2 * Math.random() - 1, 2 * Math.random() - 1])
      }
    }
  } else {
    cubePose = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1], [1, 1, 1], ]
  }

  const geometry = new THREE.BoxGeometry(document.location.search.substr(1) || 1,document.location.search.substr(1) || 1,document.location.search.substr(1) || 1);
  
  const edgeMaterial = new THREE.MeshBasicMaterial({
    color: '#000000'
  })
  const edges = new THREE.EdgesGeometry(geometry);
  
  for (let props of cubePose) {
    const material = new THREE.MeshBasicMaterial
    // Extract edges
    const cube = new THREE.Mesh(geometry,material);
    cube.material.color.r = Math.abs(props[0])
    cube.material.color.g = Math.abs(props[1])
    cube.material.color.b = Math.abs(props[2])

    cube.position.x = props[0] * 2
    cube.position.y = props[1] * 2
    cube.position.z = -props[2] * 2

    const edgeLines = new THREE.LineSegments(edges,edgeMaterial);
    cube.add(edgeLines);
    // Add edges as a child of the cube

    scene.add(cube);
  }

  window.rotspeed = []
  for (let a = 0; a < scene.children.length + 1; a++) {
    rotspeed.push([2 * (2 * Math.random() - 1), 2 * (2 * Math.random() - 1), 2 * (2 * Math.random() - 1)])
  }
}


window.frameLoop=async function(time=window.frameStartTime){
  const dt=time/1000-frameStartTime
  frameStartTime=time/1000
  
  scene.children[1].rotation.x+=rot*dt
  scene.children[1].rotation.y+=rot/5*dt
  
  updateCanvas()
  renderer.render(scene, camera);

  key.endOfFrame()
  requestAnimationFrame(frameLoop)
}

;(async () => {
  await importAll()
  await setup()
  await buildScene()
  statusCard.textContent = 'trying first frame'
  
  window.frameStartTime=performance.now()/1000
  await frameLoop()
  statusCard.remove()
}
)()
