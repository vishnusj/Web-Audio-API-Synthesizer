/**
* NOTE:
* Some of the features of the  Web Audio API currently only work on Chrome, hence the 'webkit' prefix!
*/

function setUp() {
    // Create audio (context) container
    var audioCtx = new (AudioContext || webkitAudioContext)();


    const gainNode = audioCtx.createGain();
    var biquadFilter = audioCtx.createBiquadFilter();
    var convolver = audioCtx.createConvolver();
    biquadFilter.type = "allpass";
    console.log("FIRST FILTER")

    var volumeSlider = document.getElementById("volume");
    var frequencySlider = document.getElementById("frequencyslide");
    var attackSlider = document.getElementById("attackSlider");
    var decaySlider = document.getElementById("decaySlider");
    var sustainSlider = document.getElementById("sustainSlider");
    var releaseSlider = document.getElementById("releaseSlider");

    var output = document.getElementById("demo");
    var outputfreq = document.getElementById("freqdemo");
    var attackDemo = document.getElementById("attackDemo");
    var decayDemo = document.getElementById("decayDemo");
    var sustainDemo = document.getElementById("sustainDemo");
    var releaseDemo = document.getElementById("releaseDemo");

    let volume = 50;
    let filterfrequency = 2793;
    attack = 0.5;
    decay = 0.5;
    sustain = 0.5;
    release = 0.5;

    output.innerHTML = 50;
    outputfreq.innerHTML = 2793;
    attackDemo.innerHTML = 0.5;
    decayDemo.innerHTML = 0.5;
    sustainDemo.innerHTML = 0.5;
    releaseDemo.innerHTML = 0.5;

    // Audio context must be enabled via user gesture
    document.getElementById('start').addEventListener('click', function (event) {
        //onload();
        audioCtx.resume().then(() => {
            //window.location.reload();
            createKeyboard(notesByKeyCode, 'keyboard');
            event.target.innerText = "Sound enabled";
            console.log('Playback resumed successfully');
            document.getElementById('start').remove();
            biquadFilter.type = "allpass";
            biquadFilter.frequency.value = filterfrequency;
        });
    });




    // Table of notes with correspending keyboard codes. Frequencies are in hertz.
    // The notes start from middle C
    var notesByKeyCode = {
        65: { noteName: 'C', frequency: 2093.004522404789077, keyName: 'a' },
        83: { noteName: 'C#', frequency: 2217.461047814976769, keyName: 's' },
        68: { noteName: 'D', frequency: 2349.318143339260482, keyName: 'd' },
        70: { noteName: 'D#', frequency: 2489.015869776647285, keyName: 'f' },
        71: { noteName: 'E', frequency: 2637.020455302959437, keyName: 'g' },
        72: { noteName: 'F', frequency: 2793.825851464031075, keyName: 'h' },
        74: { noteName: 'F#', frequency: 2959.955381693075191, keyName: 'j' },
        75: { noteName: 'G', frequency: 3135.963487853994352, keyName: 'k' },
        76: { noteName: 'G#', frequency: 3322.437580639561108, keyName: 'l' },
        186: { noteName: 'A', frequency: 3520.000000000000000, keyName: ';' },
        90: { noteName: 'A#', frequency: 3729.310092144719331, keyName: 'z' },
        88: { noteName: 'B', frequency: 3951.066410048992894, keyName: 'x' }

    };

    // Volume Control Slider value
    volumeSlider.oninput = function () {
        output.innerHTML = this.value;
        volume = this.value;
    }

    // Frequency Control Slider value
    frequencySlider.oninput = function () {
        outputfreq.innerHTML = this.value;
        filterfrequency = parseFloat(this.value);
        biquadFilter.frequency.value = filterfrequency;
    }


    // Attack Control Slider value
    attackSlider.oninput = function () {
        attackDemo.innerHTML = this.value;
        attack = parseFloat(this.value);
        adsr(audioCtx.currentTime, attack, decay, sustain, release, 0);
    }

    // Decay Control Slider value
    decaySlider.oninput = function () {
        decayDemo.innerHTML = this.value;
        decay = parseFloat(this.value);
        adsr(audioCtx.currentTime, attack, decay, sustain, release, 0);
    }

    // Sustain Control Slider value
    sustainSlider.oninput = function () {
        sustainDemo.innerHTML = this.value;
        sustaint = parseFloat(this.value);
        adsr(audioCtx.currentTime, attack, decay, sustain, release, 0);
    }

    // Sustain Control Slider value
    releaseSlider.oninput = function () {
        releaseDemo.innerHTML = this.value;
        release = parseFloat(this.value);
        adsr(audioCtx.currentTime, attack, decay, sustain, release, 0);
    }

    function Key(keyCode, noteName, keyName, frequency) {
        var keyHTML = document.createElement('div');
        var keySound = new Sound(frequency, 'sine');

        /* Cheap way to map key on touch screens */
        keyHTML.setAttribute('data-key', keyCode);

        /* Style the key */
        keyHTML.className = 'key';
        keyHTML.innerHTML = noteName + '<br><span>' + keyName + '</span>';

        return {
            html: keyHTML,
            sound: keySound
        };
    }

    function Sound(frequency, type) {
        this.osc = audioCtx.createOscillator(); // Create oscillator node
        this.pressed = false; // flag to indicate if sound is playing

        /* Set default configuration for sound */
        if (typeof frequency !== 'undefined') {
            /* Set frequency. If it's not set, the default is used (440Hz) */
            this.osc.frequency.value = frequency;
        }

        // Set waveform type.
        this.osc.type = type || 'sine';

        /* Start playing the sound. You won't hear it yet as the oscillator node needs to be
        piped to output (AKA your speakers). */
        this.osc.start(0);
    };

    Sound.prototype.play = function () {
        if (!this.pressed) {
            this.pressed = true;
            adsr(audioCtx.currentTime, attack, decay, sustain, release, 0);
            gainNode.gain.value = volume / 100;
            console.log("Filter Final: " + biquadFilter.type);
            console.log("Filter Freq: " + biquadFilter.frequency.value);

            this.osc.connect(biquadFilter);
            biquadFilter.connect(gainNode).connect(audioCtx.destination);
        }
    };

    Sound.prototype.stop = function () {
        this.pressed = false;
        //this.osc.disconnect();
    };



    function createKeyboard(notes, containerId) {
        var sortedKeys = []; // Placeholder for keys to be sorted
        var waveFormSelector = document.getElementById('soundType');
        var filterSelector = document.getElementById('filterType');

        for (var keyCode in notes) {
            var note = notes[keyCode];

            /* Generate playable key */
            note.key = new Key(keyCode, note.noteName, note.keyName, note.frequency);

            /* Add new key to array to be sorted */
            sortedKeys.push(notes[keyCode]);
        }

        /* Sort keys by frequency so that they'll be added to the DOM in the correct order */
        sortedKeys = sortedKeys.sort(function (note1, note2) {
            if (note1.frequency < note2.frequency) return -1;
            if (note1.frequency > note2.frequency) return 1;

            return 0;
        });

        // Add those sorted keys to DOM
        for (var i = 0; i < sortedKeys.length; i++) {
            document.getElementById(containerId).appendChild(sortedKeys[i].key.html);
        }

        var playNote = function (event) {
            event.preventDefault();

            var keyCode = event.keyCode || event.target.getAttribute('data-key');

            if (typeof notesByKeyCode[keyCode] !== 'undefined') {
                // Pipe sound to output (AKA speakers)
                notesByKeyCode[keyCode].key.sound.play();

                // Highlight key playing
                notesByKeyCode[keyCode].key.html.className = 'key playing';
            }
        };

        var endNote = function (event) {
            var keyCode = event.keyCode || event.target.getAttribute('data-key');

            if (typeof notesByKeyCode[keyCode] !== 'undefined') {
                // Kill connection to output
                notesByKeyCode[keyCode].key.sound.stop();

                // Remove key highlight
                notesByKeyCode[keyCode].key.html.className = 'key';
            }
        };

        var setWaveform = function (event) {
            for (var keyCode in notes) {
                notes[keyCode].key.sound.osc.type = this.value;
            }

            // Unfocus selector so value is not accidentally updated again while playing keys
            this.blur();
        };

        var setFilter = function (event) {
            // console.log("Filter"+this.value);
            biquadFilter.type = this.value;
            biquadFilter.frequency.value = filterfrequency;

            // Unfocus selector so value is not accidentally updated again while playing keys
            this.blur();
        };

        // Check for changes in the waveform selector and update all oscillators with the selected type
        waveFormSelector.addEventListener('change', setWaveform);
        filterSelector.addEventListener('change', setFilter)

        window.addEventListener('keydown', playNote);
        window.addEventListener('keyup', endNote);
        window.addEventListener('touchstart', playNote);
        window.addEventListener('touchend', endNote);
    }
    //ADSR Functio

    function adsr(T, a, d, s, r, sustain) {
        
        function set(v, t) { gainNode.gain.linearRampToValueAtTime(v, T + t); }
        set(0.0, -T);
        set(0.0, 0);
        set(1.0, a);
        set(sustain, a + d);
        set(sustain, a + d + s);
        set(0.0, a + d + s + r);
        //return gain;
    }






    document.getElementById('stop').addEventListener('click', function (event) {
        audioCtx.close();
        window.location.reload();

    });
}





window.onload = function () {
    this.setUp();
}