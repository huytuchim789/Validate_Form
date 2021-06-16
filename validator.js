function Validator(options) {
    //Tìm cha của thẻ input(cha ngoài cùng)
    function getParent(element,selector) {
        while(element.parentElement){
            if(element.parentElement.matches(selector))
                return element.parentElement
            element=element.parentElement
        }
    }
    var rulesSelector={};
    function validate(inputElement,rule) {
        var errorMessage=rule.test(inputElement.value);
        var errorElement=getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector)
        //Lấy ra các rules của selector
        //nếu có lỗi thì dừng việc kiểm tra
        var rules=rulesSelector[rule.selector];
        for(var i=0;i<rules.length;i++){
            switch(inputElement.type){
                case 'checkbox':
                    break
                case 'radio':
                        errorMessage=rules[i](
                            formElement.querySelector(rule.selector+':checked')
                        )
                        break
                default:
                    errorMessage=rules[i](inputElement.value)
            }
          
            if(errorMessage)
            break;
        }

        if(errorMessage){
            errorElement.innerText=errorMessage;
            getParent(inputElement,options.formGroupSelector).classList.add('invalid')
        }
        else{
            errorElement.innerText='';
            getParent(inputElement,options.formGroupSelector).classList.remove('invalid')
        }
        return !errorMessage
    }
    var formElement=document.querySelector(options.form)
    console.log(options.rules)
    if(formElement){
        formElement.onsubmit=function(e) {
            //nếu chưa vượt qua toàn bộ rule thì 
            var isFormValid=true;
            e.preventDefault();
            options.rules.forEach(function (rule) {
                var inputElement=formElement.querySelector(rule.selector)
                var isValid=validate(inputElement,rule)
                if(!isValid)
                    isFormValid=false
            })
            //nếu submit được thì lưu giá trị ở đây
            if(isFormValid){
                if(typeof options.onsubmit === 'function'){
                    var enableInputs=formElement.querySelectorAll('[name]:not(disabled)')
                    var formValues=Array.from(enableInputs).reduce(function (acccumulator,currentValue) {
                        console.log(currentValue)
                        switch(currentValue.type){
                            case 'radio':
                                if(currentValue.matches(':checked')) //Element.matches:kiểm tra xem element này có được selector bởi :checked hay k
                                    acccumulator[currentValue.name]=currentValue.value
                                
                            break;
                            case 'checkbox':
                                if(!currentValue.matches(':checked'))
                                    return acccumulator
                                if(!Array.isArray(acccumulator[currentValue.name]))
                                    acccumulator[currentValue.name]=[]
                                acccumulator[currentValue.name].push(currentValue.value)
                            break
                            case 'file':
                                acccumulator[currentValue.name]=currentValue.files //riêng với file k dùng trường value mà phải dùng trường files để in ra context path
                            break
                                default:
                                acccumulator[currentValue.name]=currentValue.value
                            break

                        }
                        return acccumulator
                    },{})
                    options.onsubmit(formValues)
                    
                }
            }
        }
        //Lặp qua mỗi rule và xử lí (lắng nghe sự kiện blur)
        options.rules.forEach(function (rule) {
            // lưu lại rule cho mỗi input
            if(Array.isArray(rulesSelector[rule.selector])){
                rulesSelector[rule.selector].push(rule.test)
            }
            else{
                rulesSelector[rule.selector]=[rule.test]
            }
            var inputElements=formElement.querySelectorAll(rule.selector)
            Array.from(inputElements).forEach(function (inputElement) {
                if(inputElement){
                    inputElement.onblur=function () {
                        //value:inputElement.value
                        //test func:rule.test
                      validate(inputElement,rule)
                        
                    }
                    inputElement.oninput=function (params) {
                        var errorElement=getParent(inputElement,options.formGroupSelector).querySelector('.form-message')
                        errorElement.innerText='';
                        getParent(inputElement,options.formGroupSelector).classList.remove('invalid')
                    }
                    inputElement.onchange=function (params) {
                        validate(inputElement,rule)

                        
                    }
                }
            })
           
        }
           
        );
    }
    console.log(rulesSelector)
}
//Định nghĩa các rules
//Nguyên tắc của các rules
//1.Khi có lỗi => trả ra message lỗi
//2.Khi hộ lệ=>Không trả ra cái gì cả
Validator.isRequired =function(selector,message) {
    return {
        selector:selector,
        test:function(value) {
            if(typeof value ==='object') 
                return value ?undefined : message ||'Vui lòng nhập trường này'
            return value.trim() ? undefined:message || 'Vui lòng nhập trường này' //nhập dấu cách cũng chết 
        }
    }
}
Validator.isEmail=function (selector) {
    return {
        selector:selector,
        test:function(value) {
            var regex=/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            return regex.test(value) ? undefined:'Email sai định dạng' //nhập dấu cách cũng chết 
        }
    }
}
Validator.minLength=function (selector,min) {
    return {
        selector:selector,
        test:function(value) {
            return value.length>=min? undefined:`Mật khẩu tối thiều ${min} ký tự` //nhập dấu cách cũng chết 
        }
    }
}
Validator.isConfirmation=function(selector,getConfirmValue,message){
    return{
        selector:selector,
        test:function(value) {
            return value === getConfirmValue() ? undefined :message || 'Giá trị nhập vào không chính xác'
        }
    }
}