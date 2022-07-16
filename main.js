var fs = require("fs");
var mime = require('mime');
const { app, BrowserWindow, screen, ipcMain, globalShortcut } = require("electron");
const formidable = require('formidable');
const path = require('path');
var randomstring = require("randomstring");
var server = require('diet');
const { networkInterfaces } = require('os');
const extract = require('extract-zip');
const shutdown = require('electron-shutdown-command');
const chpr = require('child_process');
const sharp = require('sharp');
var ffmpeg = require('fluent-ffmpeg');

var WiFiControl = require('wifi-control');
WiFiControl.init({
    debug: true
});

const crypto = require('crypto');

const Photo = require('./Models/Photo.js');
const Setting = require('./Models/Setting.js');
const Module = require('./Models/Module.js');

//checkSettings
var mainSettings = {
    color: {
        status: false,
        type: 1,
        value: '#000000'
    },
    delay: {
        status: false,
        type: 3,
        value: 15000
    },
    overlay: {
        status: false,
        type: 1,
        value: '../node_modules/vegas/dist/overlays/01.png'
    },
    overlayMode: {
        status: false,
        type: 1,
        value: 'yes'
    },
    password: {
        status: false,
        type: 1,
        value: 'e10adc3949ba59abbe56e057f20f883e'
    },
    shuffle: {
        status: false,
        type: 2,
        value: 0
    },
    timer: {
        status: false,
        type: 2,
        value: 1
    },
}

//end

console.log('exit oldum');

const requestKey = randomstring.generate();

global = {};
var mainWin = null;

const port = '8000';
var width = 0;
var height = 0;
var wifiCheck = setInterval(wifiCheckFunc, 5000);
var videoTasks = [];

var dApp = server();
dApp.listen('http://0.0.0.0:'+port);

var ect = require('diet-ect-fix')({ path: dApp.path+'/PanViews' })
dApp.header(ect)

var cookie = require('diet-cookies');
dApp.header(cookie)

const static = require('diet-static-middleware')({
    path: dApp.path + '/Static',
    cache: 'public',
    expires: 604800000,
    powered: 'diet-static-uniqlab',
    server: 'uniqlab-nodejs'
});

dApp.footer(static);

dApp.get('/get-module-file', async function ($){
    if(!$.query.key || !$.query.file || $.query.key != requestKey){
        $.status(401);
        $.end('Invalid Request!!');
        return false;
    }

    const tempFolder = require("path").dirname(app.getPath("exe"))+'/Modules';
    if(!fs.existsSync(tempFolder+$.query.file)){
        $.status(401);
        $.end('File Not Found!!');
        return false;
    }

    var readStream = fs.createReadStream(tempFolder+$.query.file);
    readStream.on("open", function(){
        $.status("200");

        const fileMime = mime.lookup(tempFolder+$.query.file);
        var headers = {
            "Content-Type": fileMime,
        };

        for(i in headers)
            $.header(i, headers[i]);

        readStream.pipe($.response);
    });
});
dApp.get('/get-file', async function ($){
    if(!$.query.key || !$.query.id || $.query.key != requestKey){
        $.status(401);
        $.end('Invalid Request!!');
        return false;
    }

    var file = await Photo.findOne({
        where: {
            id: $.query.id
        }
    });

    if(!file){
        $.status(401);
        $.end('Invalid Media!!');
        return false;
    }

    if(file.status != 1){
        if($.query.forPan != 'ok'){
            $.status(401);
            $.end('Invalid Media!!');
            return false;
        }
    }

    if(file.area == 0){
        const tempFolder = require("path").dirname(app.getPath("exe"))+'/tempUploadArea';
        if(!fs.existsSync(tempFolder+file.path)){
            $.status(401);
            $.end('Media Not Found!!');
            return false;
        }
        
        var readStream = fs.createReadStream(tempFolder+file.path);
        readStream.on("open", function(){
            $.status("200");

            const fileMime = mime.lookup(tempFolder+file.path);
            var headers = {
                "Content-Type": fileMime,
            };
    
            for(i in headers)
                $.header(i, headers[i]);

            readStream.pipe($.response);
        });
    }
});

dApp.get('/', async function ($) {
    if($.cookies.password && $.cookies.password == await getSetting('password')){
        $.redirect('/dashboard') 
    }

    $.html('login.html')
});

dApp.post('/login-action', async function ($) {
    data = {
        status: false,
        message: 'Wrong Password.'
    };
    if($.body.password != undefined){
        var md5 = crypto.createHash('md5').update($.body.password.toString()).digest("hex");

        if(md5 == await getSetting('password')){
            $.cookies.set('password', md5)

            data = {
                status: true,
                message: ''
            };
        }
    }

    $.data = data;
	$.json();
	$.end();
});

dApp.post('/reboot-action', checkLoginMiddleware, function ($) {
    data = {
        status: true,
        message: ''
    };
    $.data = data;
	$.json();
	$.end();

    shutdown.reboot();
});

dApp.post('/logout-action', checkLoginMiddleware, function ($) {
    $.cookies.delete('password');
    
    data = {
        status: true,
        message: ''
    };
    $.data = data;
	$.json();
	$.end();
});

dApp.post('/get-files', checkLoginMiddleware, async function ($){
    var photos = await Photo.findAll({
        order: [
            ['_order']
        ],
    });

    $.data = {
        status: true,
        message: '',
        items: photos,
    };

    $.json();
    $.end();

    return false;
});

dApp.post('/get-modules', checkLoginMiddleware, async function ($){
    var modules = await Module.findAll({
    });

    $.data = {
        status: true,
        message: '',
        items: modules,
    };

    $.json();
    $.end();

    return false;
});

dApp.post('/change-orders', checkLoginMiddleware, async function ($){
    $.data = {
        status: false,
        message: ''
    };

    if(!$.body.orders){
        $.data.message = 'Invalid request.';

        $.json();
	    $.end();

        return false;
    }

    var orders = $.body.orders;

    if(!Array.isArray(orders))
        $.data.message = 'Invalid request.';
    else{
        var count = await Photo.count();
        if(orders.length != count){
            $.data.message = 'Invalid request.';
        }else{
            for(var i=0;i<orders.length;i++){
                await Photo.update({
                    order: i
                }, {
                    where: {
                        id: orders[i]
                    }
                });
            }

            var photos = await Photo.findAll({
                where: {
                    status: 1
                },
                order: [
                    ['_order']
                ],
            });
    
            if(mainWin != null){
                mainWin.webContents.send('updated-files', {
                    slides: photosFriendly(photos)
                });
            }
    
            $.data.status = true;
        }
    }

    $.json();
    $.end();
});

dApp.post('/upload-module', checkLoginMiddleware, checkUploadMiddleware, async function ($){
    $.data = {
        status: false,
        message: ''
    };
    if(!$.file || !$.file.mimetype){
        $.data.message = 'File not selected.';

        $.json();
	    $.end();

        return false;
    }
    
    if($.file.mimetype != 'application/zip'){
        $.data.message = 'Invalid file type. Only allowed:zip';

        $.json();
	    $.end();

        return false;
    }

    const tempFolder = require("path").dirname(app.getPath("exe"))+'/Modules';
    const newFilePath = tempFolder+'/'+$.file.newFilename+'.zip';
    
    var settings = {
        key: '',
    };
    fs.rename($.file.filepath, newFilePath, async function (err) {

        try {
            await extract(newFilePath, { dir: tempFolder+'/'+$.file.newFilename });

            fs.unlinkSync(newFilePath);
            if(!fs.existsSync(tempFolder+'/'+$.file.newFilename+'/settings.json') || !fs.existsSync(tempFolder+'/'+$.file.newFilename+'/module.js')){
                fs.rmSync(tempFolder+'/'+$.file.newFilename, { recursive: true, force: true });

                $.data.message = 'Invalid zip file.';

                $.json();
                $.end();
        
                return false;
            }

            var rawdata = fs.readFileSync(tempFolder+'/'+$.file.newFilename+'/settings.json');
            settings = JSON.parse(rawdata);
            if(!settings.name || !settings.key || !settings.ver || !settings.settings){
                fs.rmSync(tempFolder+'/'+$.file.newFilename, { recursive: true, force: true });
                $.data.message = 'Invalid zip file.';

                $.json();
                $.end();
        
                return false;
            }

            const checkModule = await Module.findOne({
                where: {
                    key: settings.key
                }
            });
            if(checkModule){
                fs.rmSync(tempFolder+'/'+$.file.newFilename, { recursive: true, force: true });
                $.data.message = 'Module Already Exist.';

                $.json();
                $.end();
        
                return false;
            }
            console.log(settings);
            
            fs.renameSync(tempFolder+'/'+$.file.newFilename, tempFolder+'/'+settings.key);

            const module = await Module.create({
                key: settings.key,
                name: settings.name,
                x: 20,
                y: 20,
                w: 250,
                h: 250,
                settings: JSON.stringify(settings),
                data: '{}',
                status: 0
            });

            $.data.status = true;
            $.data.module = module;
            
        } catch (err) {
            if(fs.existsSync(newFilePath)){
                fs.unlinkSync(newFilePath);
            }
            if(fs.existsSync(tempFolder+'/'+$.file.newFilename)){
                fs.rmSync(tempFolder+'/'+$.file.newFilename, { recursive: true, force: true });
            }
            if(settings.key != '' && fs.existsSync(tempFolder+'/'+settings.key)){
                fs.rmSync(tempFolder+'/'+settings.key, { recursive: true, force: true });
            }
            
            console.log(err);

            $.data.message = 'Invalid zip file.';
        }

        

        //$.data.status = true;
        //$.data.item = photo;

        $.json();
        $.end();

    });
});

dApp.post('/upload-file', checkLoginMiddleware, checkUploadMiddleware, async function ($){
    $.data = {
        status: false,
        message: ''
    };
    if(!$.file || !$.file.mimetype){
        $.data.message = 'File not selected.';

        $.json();
	    $.end();

        return false;
    }
    
    if($.file.mimetype != 'image/png' && $.file.mimetype != 'image/jpeg' && $.file.mimetype != 'video/mp4' && $.file.mimetype != 'video/quicktime'){
        $.data.message = 'Invalid file type. Only allowed:png, jpg, jpeg, mp4';
        $.json();
	    $.end();

        return false;
    }

    if($.file.mimetype == 'image/png' || $.file.mimetype == 'image/jpeg'){
        if(!$.body.top || !$.body.left || !$.body.width || !$.body.height){
            $.data.message = 'The image is not cropped.';
    
            $.json();
            $.end();
    
            return false;
        }
    }

    const tempFolder = require("path").dirname(app.getPath("exe"))+'/tempUploadArea';
    const newFilePath = tempFolder+'/'+$.file.newFilename;
    
    fs.rename($.file.filepath, newFilePath, async function (err) {

        var delay = await getSetting('delay');
        var type = 1;
        //var title = path.parse($.file.originalFilename).name;
        var title = null;
        var status = 1;
        var quicktime = null;
        if($.file.mimetype == 'video/mp4' || $.file.mimetype == 'video/quicktime'){
            status = 0;
            var newFilePathCrop = newFilePath+'-crop';
            $.file.newFilename = $.file.newFilename+'-crop';
            type = 2;
            
            quicktime = {
                file: newFilePath,
                nFile: newFilePathCrop,
            };
        }else{
            var newFilePathCrop = newFilePath+'-crop';
            await sharp(newFilePath).rotate().extract({ width: parseInt($.body.width), height: parseInt($.body.height), left: parseInt($.body.left), top: parseInt($.body.top) }).resize(width, height).jpeg({ mozjpeg: true }).toFile(newFilePathCrop);
            fs.unlinkSync(newFilePath);
            $.file.newFilename = $.file.newFilename+'-crop';

            if($.body.title !== undefined){
                title = $.body.title;
            }
        }

        if(title == '')
            title = null;
        
        var photo = await Photo.create({
            path: '/'+$.file.newFilename,
            title: title,
            type: type,
            delay: delay,
            status: status,
        });

        if($.file.mimetype == 'video/mp4' || $.file.mimetype == 'video/quicktime'){
            quicktime.id = photo.id;
            videoTasks.push(quicktime);
        }

        $.data.status = true;
        $.data.item = photo;

        $.json();
        $.end();

        if(mainWin != null){
            var photos = await Photo.findAll({
                where: {
                    status: 1
                },
                order: [
                    ['_order']
                ],
            });

            mainWin.webContents.send('updated-files', {
                slides: photosFriendly(photos)
            });
        }
    });
});

dApp.post('/update-module', checkLoginMiddleware, async function ($){
    $.data = {
        status: false,
        message: '',
        data: $.body
    };

    if(!$.body.id || !$.body.x || !$.body.y || !$.body.w || !$.body.h || !$.body.settings || typeof $.body.settings !== 'object'){
        $.data.message = 'All fields must be filled.';

        $.json();
	    $.end();

        return false;
    }

    var id = $.body.id;

    var module = await Module.findOne({
        where: {
            id: id
        }
    })
    if(module == null){
        $.data.message = 'Module not found.';

        $.json();
	    $.end();

        return false;
    }

    var settings = JSON.parse(module.settings);
    for (const [key, value] of Object.entries(settings.settings)) {
        if(value.require && !$.body.settings[key] == undefined){
            $.data.message = 'All fields must be filled.';

            $.json();
            $.end();
    
            return false;
        }
    };

    await Module.update({
        x: $.body.x,
        y: $.body.y,
        w: $.body.w,
        h: $.body.h,
        data: JSON.stringify($.body.settings),
    }, {
        where: {
            id: id
        }
    });

    var modules = await Module.findAll({
        where: {
            status: 1
        }
    });

    if(mainWin != null){
        mainWin.webContents.send('updated-modules', {
            modules: modulesFriendly(modules)
        });
    }

    $.data.status = true;

    $.json();
    $.end();
});
dApp.post('/update-file', checkLoginMiddleware, async function ($){
    $.data = {
        status: false,
        message: ''
    };

    if(!$.body.id || !$.body.color || !$.body.transition || !$.body.transitionDuration || !$.body.delay){
        $.data.message = 'All fields must be filled.';

        $.json();
	    $.end();

        return false;
    }

    var found = false;
    for(var i=0;i<videoTasks.length;i++){
        if(videoTasks[i].id == $.body.id){
            found = true;
            break;
        }
    }

    if(found){
        $.data.message = 'The video is being processed. No action can be taken at this stage.';

        $.json();
	    $.end();

        return false;
    }
    
    var id = $.body.id;
    var title = $.body.title;
    var color = $.body.color;
    var transition = $.body.transition;
    var transitionDuration = $.body.transitionDuration;
    var delay = $.body.delay;

    if(!title || title == '')
        title = null;

    var transitions = [
        'fade',
        'fade2',
        'slideLeft',
        'slideLeft2',
        'slideRight',
        'slideRight2',
        'slideUp',
        'slideUp2',
        'slideDown',
        'slideDown2',
        'zoomIn',
        'zoomIn2',
        'zoomOut',
        'zoomOut2',
        'swirlLeft',
        'swirlLeft2',
        'swirlRight',
        'swirlRight2',
        'burn',
        'burn2',
        'blur',
        'blur2',
        'flash',
        'flash2'
    ];
    var photo = await Photo.findOne({
        where: {
            id: id
        }
    })
    if(photo == null){
        $.data.message = 'Media not found.';
    }else
    if(!isHexColor(color)){
        $.data.message = 'Color must be current hex code.';
    }else
    if(parseInt(delay) < 1000){
        $.data.message = 'Delay must be greater than 1sec.';
    }else
    if(parseInt(transitionDuration) < 1000){
        $.data.message = 'Transition duration must be greater than 1sec.';
    }else
    if(!transitions.includes(transition)){
        $.data.message = 'Invalid transition value.';
    }else{
        await Photo.update({
            title: title,
            color: color,
            transition: transition,
            transitionDuration: transitionDuration,
            delay: delay,
        }, {
            where: {
                id: id
            }
        });

        var photos = await Photo.findAll({
            where: {
                status: 1
            },
            order: [
                ['_order']
            ],
        });

        if(mainWin != null){
            mainWin.webContents.send('updated-files', {
                slides: photosFriendly(photos)
            });
        }

        $.data.status = true;
    }

    $.json();
    $.end();
});

dApp.post('/change-status', checkLoginMiddleware, async function ($){
    $.data = {
        status: false,
        message: ''
    };

    if(!$.body.id || !$.body.status){
        $.data.message = 'All fields must be filled.';

        $.json();
	    $.end();

        return false;
    }

    var id = $.body.id;
    var status = $.body.status;

    var photo = await Photo.findOne({
        where: {
            id: id
        }
    })
    if(photo == null)
        $.data.message = 'Media not found.';
    else if(!['active', 'passive', 'remove'].includes(status))
        $.data.message = 'Invalid update type.';
    else{

        var found = false;
        for(var i=0;i<videoTasks.length;i++){
            if(videoTasks[i].id == photo.id){
                found = true;
                break;
            }
        }

        if(found){
            $.data.message = 'The video is being processed. No action can be taken at this stage.';
        }else{
            if(status == 'remove'){
                await Photo.destroy({
                    where: {
                        id: id
                    }
                });
    
                if(photo.area == 0){
                    const tempFolder = require("path").dirname(app.getPath("exe"))+'/tempUploadArea';
                    if(fs.existsSync(tempFolder+photo.path)){
                        fs.unlinkSync(tempFolder+photo.path);
                    }
                }
            }else{
                status = (status == 'active' ? 1 : 0);
    
                await Photo.update({
                    status: status
                }, {
                    where: {
                        id: id
                    }
                });
        
            }
            
            var photos = await Photo.findAll({
                where: {
                    status: 1
                },
                order: [
                    ['_order']
                ],
            });
    
            if(mainWin != null){
                mainWin.webContents.send('updated-files', {
                    slides: photosFriendly(photos)
                });
            }
    
            $.data.status = true;
        }
    }

    $.json();
    $.end();
});

dApp.post('/change-module-status', checkLoginMiddleware, async function ($){
    $.data = {
        status: false,
        message: ''
    };

    if(!$.body.id || !$.body.status){
        $.data.message = 'All fields must be filled.';

        $.json();
	    $.end();

        return false;
    }

    var id = $.body.id;
    var status = $.body.status;

    var module = await Module.findOne({
        where: {
            id: id
        }
    })
    if(module == null)
        $.data.message = 'Module not found.';
    else if(!['active', 'passive', 'remove'].includes(status))
        $.data.message = 'Invalid update type.';
    else{
        if(status == 'remove'){
            await Module.destroy({
                where: {
                    id: id
                }
            });

            const tempFolder = require("path").dirname(app.getPath("exe"))+'/Modules';
            if(fs.existsSync(tempFolder+'/'+module.key)){
                fs.rmSync(tempFolder+'/'+module.key, { recursive: true, force: true });
            }

        }else{
            status = (status == 'active' ? 1 : 0);

            await Module.update({
                status: status
            }, {
                where: {
                    id: id
                }
            });
    
        }
        
        var modules = await Module.findAll({
            where: {
                status: 1
            }
        });

        if(mainWin != null){
            mainWin.webContents.send('updated-modules', {
                modules: modulesFriendly(modules)
            });
        }

        $.data.status = true;
    }

    $.json();
    $.end();
});

dApp.post('/update-settings-action', checkLoginMiddleware, async function ($){
    $.data = {
        status: false,
        message: ''
    };

    if(!$.body.color || !$.body.delay || !$.body.overlayMode || !$.body.overlay || !$.body.shuffle || !$.body.timer){
        $.data.message = 'All fields must be filled.';

        $.json();
	    $.end();

        return false;
    }

    var color = $.body.color;
    var delay = $.body.delay;
    var overlayMode = $.body.overlayMode;
    var overlay = $.body.overlay;
    var shuffle = $.body.shuffle;
    var timer = $.body.timer;

    var overlays = [
        '../node_modules/vegas/dist/overlays/01.png',
        '../node_modules/vegas/dist/overlays/02.png',
        '../node_modules/vegas/dist/overlays/03.png',
        '../node_modules/vegas/dist/overlays/04.png',
        '../node_modules/vegas/dist/overlays/05.png',
        '../node_modules/vegas/dist/overlays/06.png',
        '../node_modules/vegas/dist/overlays/07.png',
        '../node_modules/vegas/dist/overlays/08.png',
        '../node_modules/vegas/dist/overlays/09.png',
    ];

    if(!isHexColor(color)){
        $.data.message = 'Color must be current hex code.';
    }else
    if(parseInt(delay) < 1000){
        $.data.message = 'Delay must be greater than 1sec.';
    }else
    if(!['yes', 'no'].includes(overlayMode)){
        $.data.message = 'Invalid overlay mode value.';
    }else
    if(!overlays.includes(overlay)){
        $.data.message = 'Invalid overlay.';
    }else
    if(!['yes', 'no'].includes(shuffle)){
        $.data.message = 'Invalid shuffle value.';
    }else
    if(!['yes', 'no'].includes(timer)){
        $.data.message = 'Invalid timer value.';
    }else{
        shuffle = (shuffle == 'yes')
        timer = (timer == 'yes')

        setSetting('color', color);
        setSetting('delay', delay);
        setSetting('overlayMode', overlayMode);
        setSetting('overlay', overlay);
        setSetting('shuffle', shuffle);
        setSetting('timer', timer);

        if(mainWin != null){
            mainWin.webContents.send('updated-settings', {
                color: color,
                delay: delay,
                overlayMode: overlayMode,
                overlay: overlay,
                shuffle: shuffle,
                timer: timer
            });
        }

        $.data.status = true;
    }

    $.json();
    $.end();
});

dApp.post('/change-password-action', checkLoginMiddleware, async function ($) {
    
    $.data = {
        status: false,
        message: ''
    };

    if(!$.body.password || !$.body.newPassword || !$.body.newPasswordAgain){
        $.data.message = 'All fields must be filled.';

        $.json();
	    $.end();

        return false;
    }

    var md5 = crypto.createHash('md5').update($.body.password.toString()).digest("hex");

    if(md5 != await getSetting('password')){
        $.data.message = 'Current password wrong.';
    }else
    if($.body.newPassword.toString().length < 6){
        $.data.message = 'New password too short. It must be min 6 chars.';
    }else
    if($.body.newPassword.toString() != $.body.newPasswordAgain.toString()){
        $.data.message = 'New password and verify not match.';
    }else{

        md5 = crypto.createHash('md5').update($.body.newPassword.toString()).digest("hex");

        setSetting('password', md5);
        $.cookies.set('password', md5)

        $.data.status = true;
    }
	$.json();
	$.end();
});

dApp.get('/dashboard', checkLoginMiddleware, async function ($) {
    $.systemSettings = await getSettings();
    $.requestKey = requestKey;
    $.port = port;
    $.screen = {
        w: width,
        h: height
    };

    $.html('dashboard.html')
});


//Window
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';


app.whenReady().then( async function(){

    await Photo.sync({force: false, logging: console.log});
    await Setting.sync({force: false, logging: console.log});
    await Module.sync({force: false, logging: console.log});


    const checkSettings = await Setting.findAll({});
    for(var i=0;i<checkSettings.length;i++)
        if(mainSettings[checkSettings[i].key])
            mainSettings[checkSettings[i].key].status = true;

    for (const [key, value] of Object.entries(mainSettings)) {
        if(!value.status)
            await Setting.create({
                key: key,
                type: value.type,
                value: value.value,
            });
    }

    if(!fs.existsSync(require("path").dirname(app.getPath("exe"))+'/tempUploadArea'))
        fs.mkdirSync(require("path").dirname(app.getPath("exe"))+'/tempUploadArea');
        
    if(!fs.existsSync(require("path").dirname(app.getPath("exe"))+'/Modules'))
        fs.mkdirSync(require("path").dirname(app.getPath("exe"))+'/Modules');
        
    

    const primaryDisplay = screen.getPrimaryDisplay();
    console.log(primaryDisplay.workAreaSize.width);
    width = primaryDisplay.workAreaSize.width;
    height = primaryDisplay.workAreaSize.height;
    
    width = 800;
    height = 1280;
    var photos = await Photo.findAll({
        where: {
            status: 1
        },
        order: [
            ['_order']
        ],
    });

    var settings = {
        color: await getSetting('color'),
        delay: await getSetting('delay'),
        overlayMode: await getSetting('overlayMode'),
        overlay: await getSetting('overlay'),
        shuffle: await getSetting('shuffle'),
        timer: await getSetting('timer'),
        slides: photosFriendly(photos),
    }


    var modules = await Module.findAll({
        where: {
            status: 1
        }
    });
    
    globalShortcut.register("CommandOrControl+R", () => {
    });
    mainWin = new BrowserWindow({
        width: width,
        height: height,
        x:0,
        y:0,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        resizable: false,
        frame: false,
        show: false
    });
    mainWin.loadFile("Views/index.html");
    //mainWin.webContents.openDevTools();
    mainWin.once('ready-to-show', () => {
//        mainWin.setAlwaysOnTop(true, 'screen');
        setTimeout(function(){
            mainWin.webContents.send('started-settings', settings);
            mainWin.webContents.send('updated-modules', {
                modules: modulesFriendly(modules),
                url: 'http://127.0.0.1:'+port+'/get-module-file?key='+requestKey+'&file=',
            });    
        }, 500);

        mainWin.show();
    });

    ipcMain.on('tablet-mode', (event, arg) => {
        chpr.execSync('C:\\Windows\\System32\\reg.exe ADD "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\WinLogon" /v "Shell" /t REG_SZ /d "explorer.exe" /f');
        shutdown.reboot();
    });

    ipcMain.on('wifi-search', (event, arg) => {
        wifiSearch();
    });

    ipcMain.on('wifi-disconnect', (event, arg) => {        
        WiFiControl.removeWiFiProfile(arg);
        
        wifiCheckFunc();
        wifiSearch();
        mainWin.webContents.send('wifi-disconnect', 'ok');
        
        return false;
    });
    
    ipcMain.on('wifi-connect', (event, arg) => {
        var _ap = {
            ssid: arg.selectedSsid,
            password: arg.input
        };
        var results = WiFiControl.connectToAP( _ap, function(err, response) {
            if (err) 
                console.log(err);
            
            mainWin.webContents.send('wifi-connect', response);
        });
        

    });
});





//Funcs

async function wifiSearch(){
    WiFiControl.scanForWiFi( function(err, response) {
        if (err) 
            console.log(err);

        var ifaceState = WiFiControl.getIfaceState();
        var connectedNetwork = '';
        if(ifaceState.connection == 'connected'){
            connectedNetwork = ifaceState.ssid;
        }
        for(var i=0;i<response.networks.length;i++){
            response.networks[i].isConnected = false;
            if(connectedNetwork != '' && response.networks[i].ssid == connectedNetwork){
                response.networks[i].isConnected = true;
            }
        }

        mainWin.webContents.send('wifi-search', response);
    });
}

async function wifiCheckFunc(){

    if(mainWin == null){
        return;
    }

    const nets = networkInterfaces();

    var ip = '';
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                ip = net.address;
                break;
            }
        }
        if(ip != '')
            break;
    }

    var ifaceState = WiFiControl.getIfaceState();

    var wifiStatus = 0;
    if(!ifaceState.success)
        wifiStatus = -2;
    else if(!ifaceState.power)
        wifiStatus = -1;
    else if(ifaceState.connection == 'connected')
        wifiStatus = 1;

    if(ip != ''){
        mainWin.webContents.send('network-status', {
            status: true,
            address: 'http://'+ip+(port != 80 ? ':'+port : ''),
            wifiStatus: wifiStatus
        });
    }else{
        mainWin.webContents.send('network-status', {
            status: false,
            address: '',
            wifiStatus: wifiStatus
        });
    }
}

async function getSetting(key, friendly = true){
    var settings = await getSettings(friendly);

    if(friendly){
        if(!settings[key])
            return null;

        return settings[key];
    }

    for(var i=0;i<settings.length;i++){
        if(settings[i].key == key)
            return settings[i];
    }

    return null;
}

async function getSettings(friendly = true){
    if(!global.settings){
        var settings = await Setting.findAll({
        });
        global.settings = settings;

    }

    if(friendly)
    return settingsFriendly(global.settings);

    return global.settings;
}

async function setSetting(key, value){
    var setting = await getSetting(key, false);
    if(setting == null)
        return false;

    if(setting.type == 2)
        value = (value ? 1 : 0)
    if(setting.type == 3)
        value = parseInt(value)
        
    Setting.update({
		value: value,
	}, {
		where: {
			key: key
		}
	});
    
    for(var i=0;i<global.settings.length;i++){
        if(global.settings[i].key == key){
            global.settings[i].value = value;
            break;
        }
    }
}
/*
1: text
2: boolean
3: integer
*/
function settingsFriendly(settings){
    var returnSetting = {};

    for(var i=0;i<settings.length;i++){
        var val = settings[i].value.toString();
        if(settings[i].type == 2)
            val = (settings[i].value == "1");
        else if(settings[i].type == 3)
            val = parseInt(settings[i].value);

        returnSetting[settings[i].key] = val;
    }
    return returnSetting;
}

/*
1: image
2: video

-1: url
0: local
1: smb
*/
function photosFriendly(photos){
    var returnPhotos = [];

    for(var i=0;i<photos.length;i++){
        var tmp = {};

        if(photos[i].type == 1){
            tmp.src = 'http://127.0.0.1:'+port+'/get-file?key='+requestKey+'&id='+photos[i].id;

        }else{
            tmp.video = {
                src: 'http://127.0.0.1:'+port+'/get-file?key='+requestKey+'&id='+photos[i].id,
                loop: true,
                mute: true
            };
        }

        tmp.delay = photos[i].delay;
        tmp.color = photos[i].color;
        tmp.transition = photos[i].transition;
        tmp.transitionDuration = photos[i].transitionDuration;
        tmp.title = photos[i].title;

        returnPhotos.push(tmp);
    }

    return returnPhotos;
}

function modulesFriendly(modules){
    var returnModules = [];

    for(var i=0;i<modules.length;i++){
        var tmp = {};
        tmp.key = modules[i].key;
        tmp.x = modules[i].x;
        tmp.y = modules[i].y;
        tmp.w = modules[i].w;
        tmp.h = modules[i].h;

        tmp.settings = {};

        var settings = JSON.parse(modules[i].settings);
        var data = JSON.parse(modules[i].data);
        for (const [key, value] of Object.entries(settings.settings)) {
            if(data[key] != undefined){
                tmp.settings[key] = data[key];
            }else{
                if(value.require){
                    tmp.settings[key] = value.default;
                }
            }
        }
        returnModules.push(tmp);
    }

    return returnModules;
}

async function checkLoginMiddleware($){
    if(!$.cookies.password || $.cookies.password != await getSetting('password')){
        $.redirect('/');
    }

    $.return();
}

async function checkUploadMiddleware($){
    var form = new formidable.IncomingForm();
    form.parse($.request, function(err, fields, files) {
        $.body = fields;
        $.file = files.file;
        
        $.return();
    });
}

function isHexColor (hex) {
    if(hex[0] == '#')
        hex = hex.substring(1);
    return typeof hex === 'string'
        && hex.length === 6
        && !isNaN(Number('0x' + hex))
}

async function videoTaskProc(){
    if(videoTasks.length > 0){
        var vid = videoTasks[0];

        var delay = 15000;
        ffmpeg(vid.file)
            .format('mp4')
            .size(width+'x?')
            .aspect((width/height))
            .autopad('#000000')
            .output(vid.nFile)
            .on('codecData', function(data) {
                var dur = data.duration.split(':');
                delay = (Math.floor(dur[2])+(parseInt(dur[1])*60)+(parseInt(dur[0]*60*60))) * 1000;
            })
            .on('end', async function() {            
                fs.unlinkSync(vid.file);

                /*
                const fsp = fs.promises;

                const  buff = new Buffer(100);
                const fileHandle = await fsp.open(vid.nFile, 'r');
                const { buffer } = await fileHandle.read(buff, 0, 100, 0);
                await fileHandle.close();
    
                const start = buffer.indexOf(Buffer.from('mvhd')) + 17;
                const timeScale = buffer.readUInt32BE(start, 4);
                const duration = buffer.readUInt32BE(start + 4, 4);
                const audioLength = Math.floor(duration/timeScale * 1000) / 1000;
                */

                console.log(delay);

                await Photo.update({
                    status: 1,
                    delay: delay
                }, {
                    where: {
                        id: vid.id
                    }
                });
                videoTasks.shift();
        
                if(mainWin != null){
                    var photos = await Photo.findAll({
                        where: {
                            status: 1
                        },
                        order: [
                            ['_order']
                        ],
                    });

                    mainWin.webContents.send('updated-files', {
                        slides: photosFriendly(photos)
                    });
                }

                setTimeout(function(){
                    videoTaskProc();
                }, 1000);
            }).on('error', async function(err, stdout, stderr) {
                setTimeout(function(){
                    videoTaskProc();
                }, 1000);
            })
            .run();
    }else{
        setTimeout(function(){
            videoTaskProc();
        }, 1000);
    }
}

videoTaskProc();