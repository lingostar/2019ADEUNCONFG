function stringWithId(stringId) {
    switch (stringId) {
        case "Pause Audio": return "오디오 일시 정지";
        case "Play Audio": return "오디오 재생";
    }
    return stringId;
}

class AudioPlayer {
    constructor(audioElement) {
        var audioParentElement = audioElement.parentElement;
        audioElement.controls = false;
        var adhocElement = document.createElement("adhoc");
        this.buttonRadius = 30;
        this.svgMargin = 3;
        this.progressRadius = 25;
        this.svgRadius = this.buttonRadius - this.svgMargin;
        adhocElement.innerHTML = `<span class="audio-button-start" role="button"><span class="audio-button-centrator"><svg class="audio-button-progress-svg" viewBox="-${this.svgRadius} -${this.svgRadius} ${2*this.svgRadius} ${2*this.svgRadius}" style="width:${2*this.svgRadius}px;height:${2*this.svgRadius}px;" xmlns="http://www.w3.org/2000/svg">
            <g class="svg-contents" stroke-width="2" fill="transparent">
                <circle class="full-circle" cx="0" cy="0" r="${this.progressRadius}" stroke="#707070"/>
                <g stroke="white">
                    <path class="progress" d=""/>
                    <circle class="complete" cx="0" cy="0" r="${this.progressRadius}"/>
                </g>
            </g>
        </svg></span></span>`;
        this.audioButtonElement = adhocElement.getElementsByClassName("audio-button-start")[0];
        this.audioButtonElement = adhocElement.removeChild(this.audioButtonElement);
        this.svgElement = this.audioButtonElement.getElementsByClassName("svg-contents")[0];
        this.svgElement.style.display = 'none';
        this.pathElement = this.svgElement.getElementsByClassName("progress")[0];
        this.pathElement.style.display = 'none';
        this.completeElement = this.svgElement.getElementsByClassName("complete")[0];
        this.completeElement.style.display = 'none';
        
        audioParentElement.insertBefore(this.audioButtonElement, audioElement);
        this.audioElement = audioParentElement.removeChild(audioElement);
        this.audioButtonElement.appendChild(this.audioElement);
        
        this.audioButtonElement.onclick = this.onButtonClick.bind(this);
        this.audioElement.onended = this.onAudioEnded.bind(this);
        this.audioElement.ontimeupdate = this.onTimeUpdate.bind(this);

        this.StateEnum = {
        AtStart: 'AtStart',
        Playing: 'Playing',
        Paused: 'Paused',
        };

        this.state = this.StateEnum.AtStart;
        this.progress = 0;
        this.updatePlayerLook();
    }
    
    updatePlayerLook() {
        switch (this.state) {
            case this.StateEnum.AtStart:
            {
                this.audioButtonElement.className = "audio-button-start";
                this.svgElement.style.display = 'none';
                this.audioButtonElement.setAttribute("aria-label", AudioPlayer.playString());
                break;
            }
            case this.StateEnum.Playing:
            {
                this.audioButtonElement.className = "audio-button-pause";
                this.svgElement.style.display = 'unset';
                this.audioButtonElement.setAttribute("aria-label", AudioPlayer.pauseString());
                break;
            }
            case this.StateEnum.Paused:
            {
                this.audioButtonElement.className = "audio-button-resume";
                this.svgElement.style.display = 'unset';
                this.audioButtonElement.setAttribute("aria-label", AudioPlayer.playString());
                break;
            }
        }
    }
    
    onAudioEnded() {
        this.audioElement.currentTime = 0;
        this.state = this.StateEnum.AtStart;
        this.updatePlayerLook();
    }
    
    onButtonClick() {
        switch (this.state) {
            case this.StateEnum.AtStart:
            {
                this.state = this.StateEnum.Playing;
                this.audioElement.play();
                break;
            }
            case this.StateEnum.Playing:
            {
                this.state = this.StateEnum.Paused;
                this.audioElement.pause();
                break;
            }
            case this.StateEnum.Paused:
            {
                this.state = this.StateEnum.Playing;
                this.audioElement.play();
                break;
            }
        }
        this.updatePlayerLook();
    }
    
    onTimeUpdate() {
        var newProgress = this.audioElement.currentTime / this.audioElement.duration;
        if (Math.abs(newProgress - this.progress) > 0.001) {
            var minFraction = 0.01;
            if (Math.abs(1.0 - newProgress) < minFraction) {
                // Practically a full circle.
                this.completeElement.style.display = 'unset';
                this.pathElement.style.display = 'none';
            } else {
                this.pathElement.style.display = 'unset';
                this.completeElement.style.display = 'none';
                var pathData = '';
                var radius = this.progressRadius;
                if (newProgress >= minFraction) {
                    // If < minFraction, the arc is very small - no need to draw it.
                    var startX = 0;
                    var startY = -radius;
                    var endAngle = (newProgress - 0.25) * ( 2 *Math.PI);
                    var endX = radius * Math.cos(endAngle);
                    var endY = radius * Math.sin(endAngle);
                    //A rx ry x-axis-rotation large-arc-flag sweep-flag x y
                    var largeArc = newProgress > 0.5 ? 1 : 0;
                    pathData = "M "+ startX + " " + startY + " A "+ radius + " "+ radius + " 0 " + largeArc + " 1 "+ endX + " " + endY;
                }
                this.pathElement.setAttribute("d", pathData);
            }
            this.progress = newProgress;
        }
    }
    
    static playString() {
        return stringWithId('Play Audio');
    }
    
    static pauseString() {
        return stringWithId('Pause Audio');
    }

    static loadInstances() {
        var audioElementArray = Array.prototype.slice.call(document.getElementsByTagName("audio"));
        audioElementArray.forEach(function(audioElement) {
                                  new AudioPlayer(audioElement);
                                  });
    }
}


function Body_onLoad() {
    AudioPlayer.loadInstances();
}

