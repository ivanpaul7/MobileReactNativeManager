import {
    EMPLOYEE_UPDATE,
    EMPLOYEE_CREATE,
    EMPLOYEES_FETCH_SUCCESS,
    EMPLOYEE_SAVE_SUCCESS
} from './types';
import firebase from 'firebase';
import {Actions} from 'react-native-router-flux';
import {AsyncStorage, NetInfo} from "react-native"

export const employeeUpdate = ({prop, value}) => {
    return {
        type: EMPLOYEE_UPDATE,
        payload: {prop, value}
    }
};


export const employeesFetch = () => {
    var map: { [email: string]: number; } = {};

    const {currentUser} = firebase.auth();
    /* server save in local storage, get from local storage and return :)*/
    // return (dispatch) => {
    //     firebase.database().ref(`/users/${currentUser.uid}/employees`)
    //         .on('value', async snapshot => {
    //             // console.log(10000000000000);
    //             // let data = snapshot.val();
    //             // let keys = Object.keys(data);
    //             // keys.forEach((key) => {
    //             //     // console.log(key);
    //             //     // console.log(data[key]);
    //             //     map[key] = data[key];
    //             // });
    //             // map['-LW6ZVomNiW7jeN_mWjs']={
    //             //     "name": "Xulescu",
    //             //     "phone": "111111",
    //             //     "shift": "Monday",
    //             // };
    //             // console.log(map);
    //             //
    //             // console.log(1111111111111);
    //             AsyncStorage.setItem('employees', JSON.stringify(snapshot.val()));
    //             // console.log(22222222222222);
    //             // let obj = await AsyncStorage.getItem('employees');
    //             // console.log(obj);
    //             // console.log(33333333333333);
    //             // let parsed = JSON.parse(obj);
    //             // console.log(parsed);
    //             // // parsed[111]={
    //             // //     "name": "yyyyy",
    //             // //     "phone": "111111",
    //             // //     "shift": "Monday",
    //             // // };
    //             // console.log(44444444444444);
    //             dispatch({type: EMPLOYEES_FETCH_SUCCESS, payload: snapshot.val()});
    //         });
    // };

    // server save in local storage, get from local storage and return :)
    NetInfo.isConnected.fetch().then(async (isConnected) => {
        if (isConnected) {
            let employees = JSON.parse(await AsyncStorage.getItem('employees'));
            console.log(employees);
            let keys = Object.keys(employees);
            // sync add :)
            keys.forEach((key) => {
                if (isNumber(key)) {
                    firebase.database().ref(`/users/${currentUser.uid}/employees`).push(employees[key]).then();
                }
            });
            // sync update :)(
            let updated = JSON.parse(await AsyncStorage.getItem('updated_employees'));
            updated.forEach((value) => {
                firebase.database().ref(`/users/${currentUser.uid}/employees/${value}`).set(employees[value]).then();
                AsyncStorage.setItem('updated_employees', JSON.stringify([]));
                }
            );
            // sync delete :)()
            let deleted = JSON.parse(await AsyncStorage.getItem('deleted_employees'));
            deleted.forEach((value) => {
                    firebase.database().ref(`/users/${currentUser.uid}/employees/${value}`).remove().then();
                    AsyncStorage.setItem('deleted_employees', JSON.stringify([]));
                }
            );

            // get from server real version
            firebase.database().ref(`/users/${currentUser.uid}/employees`)
                .on('value', async snapshot => {
                    AsyncStorage.setItem('employees', JSON.stringify(snapshot.val()));
                });
        } else {
            // alert("no internet!!!")
        }
    })


    console.log("FETCH 1111111111111111111111111");
    return async (dispatch) => {
        let obj = await AsyncStorage.getItem('employees');
        if (obj == null) {
            AsyncStorage.setItem('employees', JSON.stringify({}));
        }
        let parsed = JSON.parse(obj);
        dispatch({type: EMPLOYEES_FETCH_SUCCESS, payload: parsed});
    };

};

function isNumber(value: string | number): boolean {
    return !isNaN(Number(value.toString()));
}

export const employeeCreate = ({name, phone, shift}) => {
    //todo
    var connectedToInternet = false;
    const {currentUser} = firebase.auth();

    return async (dispatch) => {
        if (connectedToInternet) {
            //todo
            firebase.database().ref(`/users/${currentUser.uid}/employees`)
                .push({name, phone, shift})
                .then(() => {
                    dispatch({type: EMPLOYEE_CREATE});
                    Actions.pop()
                });
        } else {
            await employeeCreateLocalStorage(name, phone, shift);
            dispatch({type: EMPLOYEE_CREATE});
            // Actions.pop()
            Actions.employeeList();
        }
    };

};

async function employeeCreateLocalStorage(name, phone, shift) {
    let employees = JSON.parse(await AsyncStorage.getItem('employees'));
    var timestamp = (new Date).getTime();
    //todo add timestamp in a list for sync
    employees["" + timestamp] = {
        "name": name,
        "phone": phone,
        "shift": shift
    };
    AsyncStorage.setItem('employees', JSON.stringify(employees));
}


export const employeeSave = ({name, phone, shift, uid}) => {
    //todo
    var connectedToInternet = false;
    const {currentUser} = firebase.auth();

    return async (dispatch) => {
        if (connectedToInternet) {
            firebase.database().ref(`/users/${currentUser.uid}/employees/${uid}`)
                .set({name, phone, shift})
                .then(() => {
                    dispatch({type: EMPLOYEE_SAVE_SUCCESS});
                    Actions.pop();
                    setTimeout(() => Actions.refresh(), 500);
                });
        } else {
            await employeeSaveLocalStorage(name, phone, shift, uid);
            dispatch({type: EMPLOYEE_SAVE_SUCCESS});
            Actions.employeeList();
            // Actions.pop();
        }
    };
};

async function employeeSaveLocalStorage(name, phone, shift, uid) {
    let employees = JSON.parse(await AsyncStorage.getItem('employees'));
    //todo add uid in a list for sync
    employees["" + uid] = {
        "name": name,
        "phone": phone,
        "shift": shift
    };
    AsyncStorage.setItem('employees', JSON.stringify(employees));


    if (!isNumber(uid)) {
        let obj = await AsyncStorage.getItem('updated_employees');
        if (obj == null) {
            AsyncStorage.setItem('updated_employees', JSON.stringify([uid]));
        }
        let array = JSON.parse(obj);
        array.push("" + uid);
        AsyncStorage.setItem('updated_employees', JSON.stringify(array))
    }
}

export const employeeDelete = ({uid}) => {
    //todo
    var connectedToInternet = false;
    const {currentUser} = firebase.auth();
    return async () => {
        if (connectedToInternet) {
            firebase.database().ref(`/users/${currentUser.uid}/employees/${uid}`)
                .remove()
                .then(() => {
                    Actions.pop();
                });
        }
        else {
            await employeeDeleteLocalStorage(uid);
            Actions.employeeList();
            //Actions.pop();

        }
    };

};

async function employeeDeleteLocalStorage(uid) {
    let employees = JSON.parse(await AsyncStorage.getItem('employees'));
    delete employees["" + uid];
    AsyncStorage.setItem('employees', JSON.stringify(employees));

    if (!isNumber(uid)) {
        let obj = await AsyncStorage.getItem('deleted_employees');
        if (obj == null) {
            AsyncStorage.setItem('deleted_employees', JSON.stringify([uid]));
        }
        let array = JSON.parse(obj);
        array.push("" + uid);
        AsyncStorage.setItem('deleted_employees', JSON.stringify(array))
    }
}