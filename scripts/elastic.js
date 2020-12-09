class Elastic {
    constructor(length, mass, nodeCount, strength, mouseControlledNode = undefined) {
        this.length = length; // length of full elastic when not under tention in pixels
        this.mass = mass; // mass in kg
        this.nodeCount = nodeCount; // amount of nodes in string. Includes ends.
        this.nodeMass = this.mass / this.nodeCount; // mass per node in kg
        this.strength = strength; // strength of elastic in Newtons / pixel
        this.nodeGoalDist = length/nodeCount; // the resting distance between two nodes
        this.nodes = {
            x: new Float64Array(this.nodeCount), // the pos in pixels
            y: new Float64Array(this.nodeCount),
            dx: new Float64Array(this.nodeCount), // the speed in pixels per second
            dy: new Float64Array(this.nodeCount)
        }
        this.paused = false;
        this.timeSpeed = 1;
        this.anchors = [];
        this.mouseControlledNode = mouseControlledNode;
    }
    avoidMouse(range, force = false) { // range = radius that the mouse pushes, force is to force this to happen,even if the user doesnt click.
        if (!force && !mouseDown[0]) { // if user doesnt click and this is not forced
            return; // do nothing
        } // else:
        for (let i = 0; i < this.nodeCount; i++) {
            let dist = getDist(mouseX, mouseY, this.nodes.x[i], this.nodes.y[i]); // dist between mouse and node
            if (dist < range) { // if mouse is close
                let direction = Math.atan2(this.nodes.y[i]-mouseY, this.nodes.x[i]-mouseX); // first y then x because Javascript is great
                this.nodes.x[i] += Math.cos(direction) * (range-dist); // move away from mouse;
                this.nodes.y[i] += Math.sin(direction) * (range-dist);
                this.nodes.dx[i] = this.nodes.dx[i]*0.9; // friction
                this.nodes.dy[i] = this.nodes.dy[i]*0.9;
            }
        }
    }
    multiTick(time, tickCount) {
        for (let i = 0; i < tickCount; i++) {
            this.fullTick(time/tickCount, i == 0);
        }
    }
    fullTick(time, doLog) { // time is in seconds
        if (!this.paused) {
            this.calculate(time*this.timeSpeed, doLog);
        }
        this.doAnchors();
        this.avoidMouse(100);
        if (!this.paused) {
            this.move(time*this.timeSpeed);
        }
    }
    calculate(time, doLog) { // time is in seconds
        for (let i = 0; i < this.nodeCount-1; i++) { // every node does the calculation for the connection between itself and the one next in the array.
            let strechDist = getDist(this.nodes.x[i], this.nodes.y[i], this.nodes.x[i+1], this.nodes.y[i+1]) - this.nodeGoalDist;
            if (strechDist > 0) {
                let acceleration = strechDist * this.strength / this.nodeMass * time / 2; // acceleration per node, hence the /2 at the end.
                let direction = Math.atan2(this.nodes.y[i+1]-this.nodes.y[i] , this.nodes.x[i+1]-this.nodes.x[i]); // from node i to node i+1
                this.nodes.dx[i  ] += Math.cos(direction) *  acceleration;
                this.nodes.dy[i  ] += Math.sin(direction) *  acceleration;
                this.nodes.dx[i+1] += Math.cos(direction) * -acceleration;
                this.nodes.dy[i+1] += Math.sin(direction) * -acceleration;
                if (doLog && i == 5) {
                    console.log(acceleration);
                }
            }
            
        }
    }
    doFriction() {
        // for (let i = 0; i <this.nodeCount; i++) {
        //     this.nodes.dx[i] = this.nodes.dx[i] * 0.999;
        //     this.nodes.dy[i] = this.nodes.dy[i] * 0.999;
        // }
    }
    doAnchors() {
        for (let i = 0; i < this.anchors.length; i++) {
            const anchor = this.anchors[i];
            this.nodes.x[anchor[0]] = anchor[1];
            this.nodes.y[anchor[0]] = anchor[2];
            this.nodes.dx[anchor[0]] = 0;
            this.nodes.dy[anchor[0]] = 0;
        }
        if (this.mouseControlledNode !== undefined) {
            this.nodes.x[this.mouseControlledNode] = mouseX;
            this.nodes.y[this.mouseControlledNode] = mouseY;
        }
    }
    setLinePath(x1, y1, x2, y2) {
        var offX = x2-x1; // offset of point two relative to point one.
        var offY = y2-y1;
        var progressFactor; // a number that goes from 0 to 1 in the loop. 0 is the first node, 0.5 is somewhere in the middle of the elastic and 1 is the last node
        for (let i = 0; i < this.nodeCount; i++) {
            progressFactor = i/(this.nodeCount-1); // calculate progress factor
            this.nodes.x[i] = x1 + (offX*progressFactor); // get the x pos along the line
            this.nodes.y[i] = y1 + (offY*progressFactor);
            this.nodes.dx[i] = 0; // reset speeds
            this.nodes.dy[i] = 0;
        }
        this.anchors = [
            [0               , x1, y1],
            [this.nodeCount-1, x2, y2]
        ];
    }
    offsetSinePath(frequency, amplitude) {
        // this.setLinePath(x1, y1, x2, y2); // set to a line
        var progressFactor; // a number that goes from 0 to 1 in the loop. 0 is the first node, 0.5 is somewhere in the middle of the elastic and 1 is the last node
        for (let i = 0; i < this.nodeCount; i++) {
            progressFactor = i/(this.nodeCount-1); // calculate progress factor
            this.nodes.y[i] += (Math.sin(progressFactor*frequency)*amplitude); // offset the line
        }
    }
    draw(ctx) {
        this.doFriction();

        ctx.strokeStyle = "#000";
        ctx.lineCap = "butt"
        for (let i = 0; i < this.nodeCount-1; i++) {
            let strechDist = Math.max(getDist(this.nodes.x[i], this.nodes.y[i], this.nodes.x[i+1], this.nodes.y[i+1]) - this.nodeGoalDist, 0);
            ctx.lineWidth = Math.max(Math.min(this.nodeCount/strechDist, 10),2.5);

            ctx.fillStyle = `hsl(0, 0%, ${(i%2)*50}%)`;
            ctx.beginPath();
            ctx.arc(this.nodes.x[i], this.nodes.y[i], ctx.lineWidth/2, 0, Math.PI*2); // the lines will have a gap, this arc fills that
            ctx.fill();

            ctx.strokeStyle = ctx.fillStyle;
            ctx.beginPath();
            ctx.moveTo(this.nodes.x[i  ], this.nodes.y[i  ]); // line between 2 nodes
            ctx.lineTo(this.nodes.x[i+1], this.nodes.y[i+1]);
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(this.nodes.x[this.nodeCount-1], this.nodes.y[this.nodeCount-1], ctx.lineWidth/2, 0, Math.PI*2); // make the end of the elastic round
        ctx.fill();

        ctx.textBaseline = "top"
        ctx.font = "30px Helvetica";
        ctx.fillStyle = "#000";
        let text = ""
        if (this.timeSpeed != 1) {
            text += `tijd snelheid = ${this.timeSpeed} s/s `;
        }
        if (this.paused) {
            text += "gepauzeerd ";
        }
        ctx.fillText(text, 0, 0);
    }
    move(time) { // time is in seconds
        for (let i = 0; i < this.nodeCount; i++) {
            this.nodes.x[i] += this.nodes.dx[i] * time; // move the node
            this.nodes.y[i] += this.nodes.dy[i] * time;
        }
    }
}