class Keyboard {
    constructor() {
      this.currentKeyboard = 0;
      this.shift = 0;
      this.max = 0;
  
      this.object = $('<div></div>');
  
      this.area = $('<div></div>');
      this.object.append(this.area);
  
      this.inputText = '';
      this.inputTextArea = null;
  
      this.input = $('<div></div>');
      this.area.append(this.input);
  
      this.buttonArea = $('<div></div>');
      this.area.append(this.buttonArea);
  
      this.cursor = $('<span></span>');
  
      this.buttons = [
        [
          {
            key: 'a',
            lKey: 'A',
          },
          {
            key: 'b',
            lKey: 'B',
          },
          {
            key: 'c',
            lKey: 'C',
          },
          {
            key: 'ç',
            lKey: 'Ç',
          },
          {
            key: 'd',
            lKey: 'D',
          },
          {
            key: 'e',
            lKey: 'E',
          },
          {
            key: 'f',
            lKey: 'F',
          },
          {
            key: 'g',
            lKey: 'G',
          },
          {
            key: 'ğ',
            lKey: 'Ğ',
          },
          {
            key: 'h',
            lKey: 'H',
          },
          {
            key: 'ı',
            lKey: 'I',
          },
          {
            key: 'i',
            lKey: 'İ',
          },
          {
            key: 'j',
            lKey: 'J',
          },
          {
            key: 'k',
            lKey: 'K',
          },
          {
            key: 'l',
            lKey: 'L',
          },
          {
            key: 'm',
            lKey: 'M',
          },
          {
            key: 'n',
            lKey: 'N',
          },
          {
            key: 'o',
            lKey: 'O',
          },
          {
            key: 'ö',
            lKey: 'Ö',
          },
          {
            key: 'p',
            lKey: 'P',
          },
          {
            key: 'r',
            lKey: 'R',
          },
          {
            key: 's',
            lKey: 'S',
          },
          {
            key: 'ş',
            lKey: 'Ş',
          },
          {
            key: 't',
            lKey: 'T',
          },
          {
            key: 'u',
            lKey: 'U',
          },
          {
            key: 'ü',
            lKey: 'Ü',
          },
          {
            key: 'v',
            lKey: 'V',
          },
          {
            key: 'w',
            lKey: 'W',
          },
          {
            key: 'x',
            lKey: 'X',
          },
          {
            key: 'y',
            lKey: 'Y',
          },
          {
            key: 'z',
            lKey: 'Z',
          },
        ],
        [
          {
            key: '1',
            lKey: '[',
          },
          {
            key: '2',
            lKey: ']',
          },
          {
            key: '3',
            lKey: '{',
          },
          {
            key: '4',
            lKey: '}',
          },
          {
            key: '5',
            lKey: '#',
          },
          {
            key: '6',
            lKey: '%',
          },
          {
            key: '7',
            lKey: '*',
          },
          {
            key: '8',
            lKey: '+',
          },
          {
            key: '9',
            lKey: '^',
          },
          {
            key: '0',
            lKey: '=',
          },
          {
            key: '-',
            lKey: '_',
          },
          {
            key: '/',
            lKey: '\\',
          },
          {
            key: ':',
            lKey: '|',
          },
          {
            key: ';',
            lKey: '~',
          },
          {
            key: '(',
            lKey: '<',
          },
          {
            key: ')',
            lKey: '>',
          },
          {
            key: '₺',
            lKey: '€',
          },
          {
            key: '&',
            lKey: '$',
          },
          {
            key: '@',
            lKey: '£',
          },
          {
            key: '"',
            lKey: '•',
          },
          {
            key: ',',
            lKey: '!',
          },
          {
            key: '?',
            lKey: '\'',
          },
        ],
      ];
  
      this.buttonCancel = $('<div></div>');
      this.area.append(this.buttonCancel);
  
      this.buttonDone = $('<div></div>');
      this.area.append(this.buttonDone);
  
  
      this.configure();
      
      return this;
    }
  
    configure(){
      this.object.css('background-color', 'rgb(0, 0, 0, 0.8)');
      this.object.css('width', '100%');
      this.object.css('height', '100%');
      this.object.css('position', 'absolute');
      this.object.css('left', '0px');
      this.object.css('top', window.innerHeight);
      this.object.css('z-index', '9999');
  
      this.area.css('margin', '50px auto');
      this.area.css('width', '460px');
      this.area.css('height', '540px');
      this.area.css('padding-top', '10px');
      this.area.css('border-radius', '10px 10px 0px 0px');
      this.area.css('background-color', '#1f1f1f');
      this.area.css('text-align', 'center');
      this.area.css('font-size', '18px');
  
      this.input.css('width', '440px');
      this.input.css('height', '50px');
      this.input.css('padding', '10px');
      this.input.css('border', '1px solid #1f1f1f');
      this.input.css('border-radius', '10px');
      this.input.css('text-align', 'center');
      this.input.css('font-size', '24px');
      this.input.css('padding-top', '5px');
      this.input.css('margin', '0 auto');
      this.input.css('color', '#1f1f1f');
      this.input.css('background-color', '#FFFFFF');
      this.input.css('text-align', 'left');
      this.input.css('white-space', 'nowrap');
      this.input.css('text-overflow', 'ellipsis');
  
  
      this.cursor.css('color', '#4184ba');
      this.cursor.html('|');
  
      setInterval((d) => {
        if(this.cursor.css('color') == 'rgb(255, 255, 255)')
          this.cursor.css('color', '#4184ba');
        else
          this.cursor.css('color', '#FFFFFF');
      }, 300);
  
      this.buttonArea.css('width', '440px');
      this.buttonArea.css('height', '360px');
      this.buttonArea.css('margin', '30px auto 0px');
      this.buttonArea.css('color', '#FFF');

  
      this.buttonPages = [];
      this.buttons.forEach((keyPages) => {
        var buttonPage = $('<div></div>');
        this.buttonPages.push(buttonPage);
  
        for(var i=0;i<31;i++){
          if(keyPages[i] == undefined){
            var button = $('<div></div>');
            button.css('width', '69px');
            button.css('height', '55px');
            button.css('padding-top', '6px');
            button.css('float', 'left');
            button.css('margin', '2px');
  
            buttonPage.append(button);
    
            continue;
          }
  
          var button = $('<div></div>');
          button.html(keyPages[i].key);
          button.attr('data-small', keyPages[i].key);
          button.attr('data-big', keyPages[i].lKey);
  
          button.css('width', '69px');
          button.css('height', '55px');
          button.css('padding-top', '6px');
          button.css('float', 'left');
          button.css('margin', '2px');
          button.css('border', '1px solid #474747');
          button.css('background-color', '#474747');
          button.css('font-size', '26px');
          button.css('border-radius', '10px');
          button.on('click', (e) => {
            this.pressButton($(e.target).attr('data-small'), $(e.target).attr('data-big'));
          });
          button.mousedown((d) => {
              $(d.target).css('background-color', '#1f1f1f');
          }).mouseup((d) => {
              $(d.target).css('background-color', '#474747');
          }).mouseleave((d) => {
              $(d.target).css('background-color', '#474747');
          });
  
          buttonPage.append(button);
  
        }
  
        var backSpace = $('<div></div>');
        backSpace.html(' ');
        backSpace.attr('data-small', ' ');
        backSpace.attr('data-big', ' ');
  
        backSpace.css('width', '142px');
        backSpace.css('height', '55px');
        backSpace.css('padding-top', '6px');
        backSpace.css('float', 'left');
        backSpace.css('margin', '2px');
        backSpace.css('border', '1px solid #474747');
        backSpace.css('background-color', '#474747');
        backSpace.css('font-size', '26px');
        backSpace.css('border-radius', '10px');
        backSpace.on('click', (e) => {
          this.pressButton(' ', ' ');
        });
        backSpace.mousedown((d) => {
            $(d.target).css('background-color', '#1f1f1f');
        }).mouseup((d) => {
            $(d.target).css('background-color', '#474747');
        }).mouseleave((d) => {
            $(d.target).css('background-color', '#474747');
        });
  
        buttonPage.append(backSpace);
  
        var change = $('<div></div>');
        change.html('#12');
  
        change.css('width', '69px');
        change.css('height', '55px');
        change.css('padding-top', '6px');
        change.css('float', 'left');
        change.css('margin', '2px');
        change.css('border', '1px solid #474747');
        change.css('background-color', '#8a8a8a');
        change.css('font-size', '26px');
        change.css('border-radius', '10px');
        change.on('click', (e) => {
          this.changeKeyboard();
        });
        change.mousedown((d) => {
            $(d.target).css('background-color', '#1f1f1f');
        }).mouseup((d) => {
            $(d.target).css('background-color', '#474747');
        }).mouseleave((d) => {
            $(d.target).css('background-color', '#474747');
        });
  
        buttonPage.append(change);
  
        var back = $('<div></div>');
        back.html('<img src="./assets/images/backspace.png" style="height:52px"><div style="position: absolute;width:69px;height:55px;top:0;"></div>');
  
        back.css('position', 'relative');
        back.css('width', '69px');
        back.css('height', '55px');
        back.css('padding-top', '0px');
        back.css('float', 'left');
        back.css('margin', '2px');
        back.css('border', '1px solid #474747');
        back.css('background-color', '#8a8a8a');
        back.css('font-size', '26px');
        back.css('border-radius', '10px');
        back.on('click', (e) => {
          this.back();
        });
  
        buttonPage.append(back);
  
        var shift = $('<div></div>');
        shift.html('<img src="./assets/images/shift.png" style="height:40px;width:55px"><div style="position: absolute;width:69px;height:55px;top:0;"></div>');
  
        shift.css('position', 'relative');
        shift.css('width', '69px');
        shift.css('height', '55px');
        shift.css('padding-top', '4px');
        shift.css('float', 'left');
        shift.css('margin', '2px');
        shift.css('border', '1px solid #474747');
        shift.css('background-color', '#8a8a8a');
        shift.css('font-size', '26px');
        shift.css('border-radius', '10px');
        shift.on('click', (e) => {
          this.setShift();
        });
  
        buttonPage.append(shift);
  
      });
  
      this.buttonPages[0].css('display', 'block');
      this.buttonPages[1].css('display', 'none');
      this.buttonArea.append(this.buttonPages[0]);
      this.buttonArea.append(this.buttonPages[1]);
  
      this.buttonCancel.html('Cancel');
      this.buttonCancel.css('width', '160px');
      this.buttonCancel.css('height', '50px');
      this.buttonCancel.css('padding', '10px');
      this.buttonCancel.css('border', '1px solid #dc3545');
      this.buttonCancel.css('border-radius', '10px');
      this.buttonCancel.css('text-align', 'center');
      this.buttonCancel.css('font-size', '24px');
      this.buttonCancel.css('padding-top', '5px');
      this.buttonCancel.css('margin-left', '10px');
      this.buttonCancel.css('float', 'left');
      this.buttonCancel.css('background-color', '#dc3545');
      this.buttonCancel.on('click', (e) => {
        this.cancel();
      });

      this.buttonDone.html('Done');
      this.buttonDone.css('width', '160px');
      this.buttonDone.css('height', '50px');
      this.buttonDone.css('padding', '10px');
      this.buttonDone.css('border', '1px solid #198754');
      this.buttonDone.css('border-radius', '10px');
      this.buttonDone.css('text-align', 'center');
      this.buttonDone.css('font-size', '24px');
      this.buttonDone.css('padding-top', '5px');
      this.buttonDone.css('margin-right', '10px');
      this.buttonDone.css('float', 'right');
      this.buttonDone.css('background-color', '#198754');
      this.buttonDone.on('click', (e) => {
        this.done();
      });
    }
  
    changeKeyboard(){
      if(this.currentKeyboard == 0){
        this.currentKeyboard = 1;
        this.buttonPages[0].css('display', 'none');
        this.buttonPages[1].css('display', 'block');
      }else{
        this.currentKeyboard = 0;
        this.buttonPages[0].css('display', 'block');
        this.buttonPages[1].css('display', 'none');
      }
      if(this.shift){
        this.shift = false;
        this.buttonPages.forEach((e) => {
          e.children().each(function(f){
            $(this).html($(this).attr('data-small'));
          });
        });
      }
    }
  
    back(){
      if(this.inputText.length < 1)
        return false;
  
      this.inputText = this.inputText.slice(0, -1);
      this.input.html(encodeHTMLEntities(this.inputText));
      this.input.append(this.cursor);
    }
  
    setShift(){
      if(!this.shift){
        this.shift = true;
        this.buttonPages.forEach((e) => {
          e.children().each(function(f){
            $(this).html($(this).attr('data-big'));
          });
        });
      }else{
        this.shift = false;
        this.buttonPages.forEach((e) => {
          e.children().each(function(f){
            $(this).html($(this).attr('data-small'));
          });
        });
      }
    }
  
    pressButton(small, big){
      if(this.max != 0){
        if(this.inputText.length >= this.max){
          return false;
        }
      }
      var char = small;
      if(this.shift)
        char = big;
  
      this.inputText = this.inputText+char;
      this.input.html(encodeHTMLEntities(this.inputText));
      this.input.append(this.cursor);
  
      if(this.shift){
        this.shift = false;
        this.buttonPages.forEach((e) => {
          e.children().each(function(f){
            $(this).html($(this).attr('data-small'));
          });
        });
      }
    }
  
    open(object, firstText, max = 0, callback = null){
      this.callback = callback;
      this.inputText = firstText;
      this.max = max;

      this.input.html(encodeHTMLEntities(this.inputText));
      this.input.append(this.cursor);
      this.object.animate({top: '0px'}, 200);
  
      this.currentKeyboard = 0;
      this.buttonPages[0].css('display', 'block');
      this.buttonPages[1].css('display', 'none');
    
      if(this.shift){
        this.shift = false;
        this.buttonPages.forEach((e) => {
          e.children().each(function(f){
            $(this).html($(this).attr('data-small'));
          });
        });
      }
  
      return this;
    }
  
    cancel(){
      this.object.animate({top: window.innerHeight}, 200);
    }
  
    done(){
      if(this.callback != null)
        this.callback(this.inputText);
    
      this.object.animate({top: window.innerHeight}, 200);    
    }
  }