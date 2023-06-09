let plot = false // If plot is drawn
const functions = [] // Array of functions
const supportedFunctions = ["sin", "cos", "tan", "log", "pow", "sqrt", "exp", "abs", "e", "pi", "^"] // Supported functions
const mathFunctions = 8 // Number of Maths supported functions
let lastStep = 50 // Last step used to draw the plot
let randomColor = false

const addListFunctions = () => {
    const list = document.getElementById("functionsList")

    for (let i = 0; i < supportedFunctions.length; i++) {
        const li = document.createElement("li")
        li.innerHTML = supportedFunctions[i]
        list.appendChild(li)
    }
}

// Get function from input creating a new anonymous function
const getFunction = () => {
    const func = document.getElementById("textFunction").value
    try {
        const translatedFunc = translateFunc(func)
        if (func === "") return null
        else {
            functions.push([func, translatedFunc])
            return new Function("x", "return " + translatedFunc)
        }
    } catch (e) {
        alert("Invalid function")
        return null
    }
}

// Translate function to javascript
const translateFunc = (stringFunc) => {
    // Remove spaces
    stringFunc = stringFunc.replaceAll(" ", "") 

    // Substitute every parenthesis
    stringFunc = stringFunc.replaceAll("[", "(") 
    stringFunc = stringFunc.replaceAll("]", ")")
    stringFunc = stringFunc.replaceAll("{", "(")
    stringFunc = stringFunc.replaceAll("}", ")")

    // Substitute |x| for abs(x)
    const regexAbs = /\|{1}.+\|{1}/g
    const foundAbs = stringFunc.match(regexAbs)

    if (foundAbs !== null) {
        for (let i = 0; i < foundAbs.length; i++) {
            const arg = foundAbs[i].substring(1, foundAbs[i].length - 1)
            stringFunc = stringFunc.replaceAll(foundAbs[i], `abs(${arg})`)
        }
    }

    // Substitute log with different base for log with base e
    const regexLog = /log\d+\({1}.+\){1}/g
    const foundLog = stringFunc.match(regexLog)

    if (foundLog !== null) {
        for (let i = 0; i < foundLog.length; i++) {
            const base = foundLog[i].substring(3, foundLog[i].indexOf("("))
            const arg = foundLog[i].substring(foundLog[i].indexOf("(") + 1, foundLog[i].indexOf(")"))
            stringFunc = stringFunc.replaceAll(foundLog[i], `(log(${arg})/log(${base}))`)
        }
    }

    // Substitute sqrt with different base for sqrt with base 2
    const regexSqrt = /sqrt\d+\({1}.+\){1}/g
    const foundSqrt = stringFunc.match(regexSqrt)

    if (foundSqrt !== null) {
        for (let i = 0; i < foundSqrt.length; i++) {
            const base = foundSqrt[i].substring(4, foundSqrt[i].indexOf("("))
            const arg = foundSqrt[i].substring(foundSqrt[i].indexOf("(") + 1, foundSqrt[i].indexOf(")"))
            stringFunc = stringFunc.replaceAll(foundSqrt[i], `(pow(${arg}, 1/${base}))`)
        }
    }

    //Substitute simple Math functions
    for (let i = 0; i < mathFunctions; i++) {
        stringFunc = stringFunc.replaceAll(supportedFunctions[i], `Math.${supportedFunctions[i]}`)
    }

    stringFunc = stringFunc.replaceAll("e", "Math.E")
    stringFunc = stringFunc.replaceAll("pi", "Math.PI")
    stringFunc = stringFunc.replaceAll("^", "**")
    
    return stringFunc
}

const draw = () => {
    const canvas = document.getElementById("plotter")
    const ctx = canvas.getContext("2d")

    const width = canvas.width
    const height = canvas.height
    const step = parseInt(width/Number(document.getElementById("step").value)) // Proportion between pixels and units
    const stepY = document.getElementById("stepY")
    stepY.value = parseInt((width/step)/2)

    // Auto adjust step to fit the plot
    if (step !== lastStep) {
        lastStep = step
        clearPlot()
    }

    // Create plot
    if (!plot) { 
        drawPlot(ctx, step, width, height)
        plot = true
    }

    // Get function
    const func = getFunction()
    if (func === null) return

    // Add function to drop list
    document.getElementById("funcList")
    const newFunc = document.createElement("a")
    newFunc.innerHTML = functions[functions.length-1][0]
    newFunc.id = functions.length-1
    document.getElementById("funcList").appendChild(newFunc)
    document.getElementById(String(functions.length-1)).setAttribute("onclick", "document.getElementById(textFunction).value = functions[this.id][0]")
    

    // Get function points
    const matrix = getPoints([], func, step, 1, -width/2, width/2)

    // Draw points of function
    ctx.beginPath()
    ctx.strokeStyle = document.getElementById("color").value
    for (let i = 0; i < matrix.length-1; i++) {
        // Use points to draw the function
        ctx.arc(matrix[i][0] + width/2, -matrix[i][1] + height/2, 0.5, 2 * Math.PI, false)
    }
    ctx.stroke()

    if (randomColor) {
        const randomColor = Math.floor(Math.random()*16777215).toString(16) // Generate random color
        const color = document.getElementById("color")
        color.value = "#" + randomColor
    }
}

const drawLine = (ctx, x1, y1, x2, y2, color, thickness) => {
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = thickness

    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    
    ctx.stroke()
}

const drawPlot = (ctx, step, width, height) => {
    // Draw axes
    drawLine(ctx, 0, height / 2, width, height / 2, "black", 1) // X axis
    drawLine(ctx, width / 2, 0, width / 2, height, "black", 1) // Y axis

    // Draw X steps
    ctx.fillStyle = "black"

    let count = 0
    for (let i = width/2; i < width + 1; i += step) {
        drawLine(ctx, i, height / 2 - 5, i, height / 2 + 5, "black", 1)
        ctx.font = "10px Arial"
        ctx.fillText(count, i + 3, height / 2 + 15)
        count++
    }

    count = 0
    for (let i = width/2; i > 0; i -= step) {
        drawLine(ctx, i, height / 2 - 5, i, height / 2 + 5, "black", 1)
        if (count === 0) {
            count--
            continue
        }
        ctx.font = "10px Arial"
        ctx.fillText(count, i, height / 2 + 15)
        count--
    }

    // Draw Y steps
    count = 0
    for (let i = height/2; i < height + 1; i += step) {
        drawLine(ctx, width / 2 - 5, i, width / 2 + 5, i, "black", 1)
        if (count === 0) {
            count--
            continue
        }
        ctx.font = "10px Arial"
        ctx.fillText(count, width / 2 + 3, i - 3)
        count--
    }
    
    count = 0
    for (let i = height/2; i > 0; i -= step) {
        drawLine(ctx, width / 2 - 5, i, width / 2 + 5, i, "black", 1)
        if (count === 0) {
            count++
            continue
        }
        ctx.font = "10px Arial"
        ctx.fillText(count, width / 2 + 3, i - 3)
        count++
    }
}

const clearPlot = () => {
    const canvas = document.getElementById("plotter")
    const ctx = canvas.getContext("2d")

    plot = false
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const input = document.getElementById("textFunction")
    input.value = ""

    draw()
}

// Get points of function
let repeat = 0 // Get more points if there is a big jump
const maxRepeat = 3 // Max number of times to repeat

const getPoints = (matrix, func, step, fstep, xstart, xend) => {
    let i = 0
    for (let x = xstart; x < xend; x+=fstep) {
        matrix.push([x, Number((step*func(x/step)).toFixed(3))])
        
        if (x > xend || x === xstart || i === 0) continue
        if (matrix[i][1] > 500 || matrix[i][1] < 0) continue
        else if (Math.abs(matrix[i][1] - matrix[i-1][1]) > 3 && repeat < maxRepeat) {
            repeat++
            getPoints(matrix, func, step, fstep/2, matrix[i-1][0], matrix[i][0])
            repeat = 0
        }
        i++
    }

    return matrix 
}

// Random color toggle
const swtichRandomColor = () => {
    randomColor = !randomColor
    if (!randomColor) {
        const colorValue = document.getElementById("color")
        colorValue.value = "#FF0000"
    }
}

// Show function list
const showFuncList = () => {
    document.getElementById("funcList").classList.toggle("show")
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches(".dropbtn")) {
      const dropdowns = document.getElementsByClassName("dropdown-content")
      for (let i = 0; i < dropdowns.length; i++) {
        const openDropdown = dropdowns[i]
        if (openDropdown.classList.contains("show")) {
          openDropdown.classList.remove("show")
        }
      }
    }
  }

// Draw plot on enter
document.addEventListener("keydown", (e) => {
    if (e.code === "Enter") {
        draw()
    }
})

// Auto adjust stepX based to Y axe
document.getElementById("stepY").addEventListener("change", (e) => {
    const step = document.getElementById("step")
    step.value = parseInt(e.target.value)*2
    clearPlot()  
})

// Auto adjust stepY based to X axe
document.getElementById("step").addEventListener("change", (e) => {
    const stepY = document.getElementById("stepY")
    stepY.value = parseInt(e.target.value)/2
    clearPlot()
})
