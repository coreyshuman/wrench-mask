(function() {
    window.onload = function() {
        let table = document.getElementById("ledTable");
        let modeBtn = document.getElementById("brightnessMode");
        var app = new App(table, modeBtn);

    }

    class App {
        constructor(_table, _modeBtn) {
            this.tableMaxRows = 9;
            this.tableMaxColumns = 24;
            this.settingCount = 8;
            this.data = new Array(54).fill(0);
            this.table = _table;
            this.brightnessMode = 0xC0;
            this.modeBtn = _modeBtn;
            this.currSetting = null;

            this.LOW = 0x40;
            this.MED = 0x80;
            this.HIGH = 0xC0;
            console.log("constructed")

            this.drawTable();
            this.table.addEventListener("click", this.handleCellClick.bind(this), false);
            this.modeBtn.addEventListener("click", this.handleModeBtnClick.bind(this), false);
            document.getElementById('saveSetting').addEventListener("click", this.handleSaveClick.bind(this), false);
            for (let i = 1; i <= this.settingCount; i++) {
                document.getElementById('setting_' + i).addEventListener("click", this.handleRetrieveClick.bind(this), false);
            }
            document.getElementById('clear').addEventListener("click", function(event) {
                this.updateData(new Array(54).fill(0));
            }.bind(this));

            this.readServer();
        }

        clearTable() {
            const table = this.table;
            var tableRows = table.getElementsByTagName('tr');
            var rowCount = tableRows.length;

            for (var x = rowCount - 1; x >= 0; x--) {
                table.deleteRow(-1);
            }
        }

        drawTable() {
            const data = this.data;
            const table = this.table;
            console.log("draw")
            this.clearTable();

            for (var j = 0; j < this.tableMaxRows; j++) {
                let row = table.insertRow(-1);
                for (let k = 0; k < this.tableMaxColumns; k++) {
                    var cell = row.insertCell(-1);
                    cell.setAttribute("id", "c_" + j + "_" + k);
                    let curIdx = j * this.tableMaxColumns + k;
                    let byteMask = 0xC0 >> (curIdx % 4) * 2;
                    let byteIdx = Math.floor(curIdx / 4);
                    let val = data[byteIdx] & byteMask;
                    let classVal = "";
                    if (val == 0) {
                        classVal = "ledOff";
                    } else if (val == this.MED >> (curIdx % 4) * 2) {
                        classVal = "ledMed";
                    } else if (val == this.LOW >> (curIdx % 4) * 2) {
                        classVal = "ledLow";
                    } else {
                        classVal = "ledHigh";
                    }
                    cell.setAttribute("class", classVal);
                }
            }
            this.printData();
        }

        updateData(data) {
            if (!data || data.length != 54) {
                console.log("invalid data");
                return;
            }
            this.data = data;
            this.drawTable();
            this.updateServer();
        }

        setBrightness(val) {
            switch (val) {
                default: this.brightnessMode = this.HIGH;
                break;
                case "med":
                        this.brightnessMode = this.MED;
                    break;
                case "low":
                        this.brightnessMode = this.LOW;
                    break;
            }
        }

        handleCellClick(event) {
            const data = this.data;
            const table = this.table;
            const el = event.target;
            const id = el.id;
            let x = NaN;
            let y = NaN;

            // get x and y value
            const s = id.substring(id.indexOf("_") + 1);
            const firstNum = s.substring(0, s.indexOf("_"));
            const lastNum = s.substring(s.indexOf("_") + 1);
            y = parseInt(firstNum);
            x = parseInt(lastNum);
            console.log("click (" + x + "," + y + ")");

            if (x >= 0 && y >= 0 && x < this.tableMaxColumns && y < this.tableMaxRows) {
                const curIdx = y * this.tableMaxColumns + x;
                const byteMask = 0xC0 >> (curIdx % 4) * 2;
                const byteIdx = Math.floor(curIdx / 4);
                const val = data[byteIdx] & byteMask;
                const setting = this.brightnessMode >> (curIdx % 4) * 2;
                if (val == this.brightnessMode >> (curIdx % 4) * 2) {
                    data[byteIdx] &= ~byteMask;
                } else {
                    data[byteIdx] &= ~byteMask;
                    data[byteIdx] |= setting;

                }

                this.drawTable();
                this.updateServer();
            }
        }

        handleSaveClick(event) {
            const setting = this.currSetting;
            if (setting == null) {
                console.log("no setting picked");
                return;
            }
            var xhttp = new XMLHttpRequest();

            //setting_N
            let id = setting.id.substring(8);
            let name = setting.value;
            console.log("save " + id + " " + name);

            xhttp.onreadystatechange = function() {
                console.log(this.status);
            };

            xhttp.open("POST", "/setting/" + id, true);
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.send(JSON.stringify({ "id": id, "name": name, "value": this.data }));
        }

        handleRetrieveClick(event) {
            var self = this;
            var xhttp = new XMLHttpRequest();
            //setting_N
            this.currSetting = event.target;
            let id = event.target.id.substring(8);
            let name = event.target.value;
            console.log("retrive " + id + " " + name);

            for (let i = 1; i <= this.settingCount; i++) {
                document.getElementById('setting_' + i).classList.remove('selected');
            }
            document.getElementById('setting_' + id).classList.add('selected');

            xhttp.onreadystatechange = function() {
                console.log(this.status);
            };
            xhttp.onload = function() {
                console.log(xhttp.response);
                var res = JSON.parse(xhttp.response);
                self.updateData(res.value);
            };
            xhttp.open("GET", "/setting/" + id, true);
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.send();
        }

        handleModeBtnClick(event) {
            const curMode = this.modeBtn.value;
            let newMode = "Full";
            if (curMode == "Full") {
                newMode = "Low";
            } else if (curMode == "Low") {
                newMode = "Med";
            }
            this.modeBtn.value = newMode;
            this.setBrightness(newMode.toLowerCase());
        }

        printData() {
            const data = this.data;
            let str = "";
            for (let i = 0; i < data.length; i++) {
                if (i > 0 && i % 6 == 0) {
                    str += "\n"
                }
                if (data[i] == undefined) {
                    str += "00";
                } else {
                    let val = data[i].toString(16);
                    if (val.length == 1) {
                        val = "0" + val;
                    }
                    str += val;
                }

                str += " ";

            }
            console.log(str);
        }

        updateServer() {
            var xhttp = new XMLHttpRequest();

            xhttp.onreadystatechange = function() {
                console.log(this.status);
            };
            xhttp.open("POST", "/data", true);
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.send(JSON.stringify({ "payload": this.data }));
        }

        readServer() {
            var self = this;
            var xhttp = new XMLHttpRequest();

            xhttp.onreadystatechange = function() {
                console.log(this.status);
            };
            xhttp.onload = function() {
                console.log(xhttp.response);
                var res = JSON.parse(xhttp.response);
                self.updateData(res.payload);
            };
            xhttp.open("GET", "/data", true);
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.send();
        }

    }

    /*
    var App = function(_table) {
        this.tableMaxRows = 9;
        this.tableMaxColumns = 24;
        this.data = new Array(54);
        this.table = _table;

        console.log("Starting App...");
        this.drawTable(this.table, this.data);
        _table.addEventListener("click", this.handleCellClick, false);
    }
    App.prototype.clearTable = function(table) {
        var tableRows = table.getElementsByTagName('tr');
        var rowCount = tableRows.length;

        for (var x = rowCount - 1; x >= 0; x--) {
            table.deleteRow(-1);
        }
    }

    App.prototype.drawTable = function(table, data) {
        if (data == null || data == undefined) {
            data = new Array(54);
        }

        console.log("draw")
        this.clearTable(table);

        for (var j = 0; j < this.tableMaxRows; j++) {
            let row = table.insertRow(-1);
            for (let k = 0; k < this.tableMaxColumns; k++) {
                var cell = row.insertCell(-1);
                cell.setAttribute("id", "c_" + j + "_" + k);
                let curIdx = j * this.tableMaxColumns + k;
                let byteMask = 0xC >> curIdx % 4;
                let byteIdx = Math.floor(curIdx / 4);
                let val = data[byteIdx] & byteMask;
                if (val == 0) {
                    cell.setAttribute("class", "ledOff");
                } else {
                    cell.setAttribute("class", "ledOn");
                }
            }
        }
    }

    App.prototype.handleCellClick = function(event) {
        var el = event.target;
        var id = el.id;
        var x = NaN;
        var y = NaN;
        console.log(App)

        // get x and y value
        var s = id.substring(id.indexOf("_") + 1);
        var firstNum = s.substring(0, s.indexOf("_"));
        var lastNum = s.substring(s.indexOf("_") + 1);
        x = parseInt(firstNum);
        y = parseInt(lastNum);
        console.log("click (" + x + "," + y + ")");
        //console.log(app.tableMaxRows)
        if (!isNaN(x) && !isNaN(y) && x >= 0 && y >= 0 && x < this.tableMaxColumns && y < this.tableMaxRows) {
            let curIdx = y * App.tableMaxColumns + x;
            let byteMask = 0xC >> curIdx % 4;
            let byteIdx = Math.floor(curIdx / 4);
            let val = data[byteIdx] & byteMask;
            if (val == 0) {
                data[byteIdx] |= byteMask;
            } else {
                data[byteIdx] &= ~byteMask;
            }
            console.log("hahah")
            App.drawTable(App.table, App.data)
        }
    }
    */
}());