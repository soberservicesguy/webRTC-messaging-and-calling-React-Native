import Contacts from 'react-native-contacts';
import { PermissionsAndroid } from 'react-native';

import {setObjectValue} from './asyncstorage_function'
const { my_logger } = require('./my_custom_logger')

// WORK ON THIS, PREMISSIONS ARE SEPARETE NOW, REMOVE FROMM HERE
function check_permission_and_save_contact(object, displayName, number){

	my_logger(null, null, 'function_entering', 'check_permission_and_save_contact', 0)

	try{

		if ( !object.props.contactsPermissionsGranted ){

			PermissionsAndroid.request(
				PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
				{
					'title': 'Contacts',
					'message': 'This app would like to view your contacts.',
					'buttonPositive': 'Please accept bare mortal'
				}
			)
			.then(() => {
				PermissionsAndroid.request(
					PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS,
					{
						'title': 'Contacts',
						'message': 'This app would like to view your contacts.',
						'buttonPositive': 'Please accept bare mortal'
					}
				)
			})
			.then(() =>{
				object.props.set_permissions_granted_for_contacts(true)
			})
			.then(() => {
				var newPerson = { 
					// recordID: recordID,
					displayName: displayName,
					phoneNumbers: [
						{
							label: 'mobile',
							number: number,
						},
					]
				}

				Contacts.addContact(newPerson)
				.then(() => console.log('new contact saved'))
			})
			.catch((err) => {
				my_logger('err', err, 'error', 'check_permission_and_save_contact', 0)
			})

		} else {
			var newPerson = { 
				// recordID: recordID,
				displayName: displayName,
				phoneNumbers: [
					{
						label: 'mobile',
						number: number,
					},
				]
			}

			Contacts.addContact(newPerson)
			.then(() => console.log('new contact saved'))

		}

		Contacts.getAll().then(contacts => console.log(JSON.stringify(contacts) ))

		


		// my_logger('returned_value', returned_value, 'function_returning', 'check_permission_and_save_contact', 0)
		// return 

	} catch (error) {

		my_logger('error', error, 'error', 'check_permission_and_save_contact', 0)


	}

	my_logger(null, null, 'function_exiting', 'check_permission_and_save_contact', 0)
	
}


function show_all_contacts_and_set_in_state(object){

	my_logger(null, null, 'function_entering', 'show_all_contacts_and_set_in_state', 0)

	try{

		Contacts.getAll()
		.then(contacts => object.props.set_contacts_list(contacts) )	
		// .then(contacts => console.log(JSON.stringify(contacts) ))	
		
		// my_logger('returned_value', returned_value, 'function_returning', 'show_all_contacts_and_set_in_state', 0)
		// return 

	} catch (err) {

		my_logger('err', err, 'error', 'show_all_contacts_and_set_in_state', 0)

	}

	my_logger(null, null, 'function_exiting', 'show_all_contacts_and_set_in_state', 0)

}


function get_all_contacts_and_save_in_storage(){

	my_logger(null, null, 'function_entering', 'get_all_contacts_and_save_in_storage', 0)

	try{

		Contacts.getAll().then(contacts => {
			// contacts returned
			// saving to asyncstorage
			setObjectValue('phonebook_contacts', contacts)
		})
		
		// my_logger('returned_value', returned_value, 'function_returning', 'get_all_contacts_and_save_in_storage', 0)
		// return 

	} catch (err) {

		my_logger('err', err, 'error', 'get_all_contacts_and_save_in_storage', 0)


	}

	my_logger(null, null, 'function_exiting', 'get_all_contacts_and_save_in_storage', 0)
	
}


// REQEUSTING PERMISSION AND GETTING AND SAVING CONTACTS
function request_contacts_permission_and_then_save_in_storage(){

	my_logger(null, null, 'function_entering', 'request_contacts_permission_and_then_save_in_storage', 0)

	try{

		PermissionsAndroid.request(
			PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
			{
				'title': 'Contacts',
				'message': 'This app would like to view your contacts.',
				'buttonPositive': 'Please accept bare mortal'
			}
		)
		.then(Contacts.getAll)
		.then(contacts => {
			setObjectValue('phonebook_contacts', contacts)
		})		
		// my_logger('returned_value', returned_value, 'function_returning', 'request_contacts_permission_and_then_save_in_storage', 0)
		// return 

	} catch (err) {

		my_logger('err', err, 'error', 'request_contacts_permission_and_then_save_in_storage', 0)

	}

	my_logger(null, null, 'function_exiting', 'request_contacts_permission_and_then_save_in_storage', 0)

}

// ADD CONTACT TO CONTACTS
// Currently all fields from the contact record except for thumbnailPath are supported for writing
function add_new_contact(){

	my_logger(null, null, 'function_entering', 'add_new_contact', 0)

	try{

		var newPerson = {
			emailAddresses: [
				{
					label: "work",
					email: "mrniet@example.com",
				},
			],
			familyName: "Nietzsche",
			givenName: "Friedrich",
			displayName: "Friedrich Nietzsche",
		}

		Contacts.addContact(newPerson)		

		// my_logger('returned_value', returned_value, 'function_returning', 'add_new_contact', 0)
		// return 

	} catch (err) {

		my_logger('err', err, 'error', 'add_new_contact', 0)

	}

	my_logger(null, null, 'function_exiting', 'add_new_contact', 0)
	
}



// FIND A PERSON FROM CONTACTS
function find_someone_in_contacts(){

	my_logger(null, null, 'function_entering', 'find_someone_in_contacts', 0)

	try{

		var newPerson = {
		  emailAddresses: [{
		    label: "work",
		    email: "mrniet@example.com",
		  }],
		}

		Contacts.openContactForm(newPerson).then(contact => {
		  // contact has been saved
		})
	
		// my_logger('returned_value', returned_value, 'function_returning', 'find_someone_in_contacts', 0)
		// return 

	} catch (err) {

		my_logger('err', err, 'error', 'find_someone_in_contacts', 0)


	}

	my_logger(null, null, 'function_exiting', 'find_someone_in_contacts', 0)
	
}


// UPDATING A CONTACT
function update_contact(){

	my_logger(null, null, 'function_entering', 'update_contact', 0)

	try{

		Contacts.getAll().then(contacts => {
			// update the first record
			let someRecord = contacts[0]
			someRecord.emailAddresses.push({
				label: "junk",
				email: "mrniet+junkmail@test.com",
			})
			Contacts.updateContact(someRecord).then(() => {
				// record updated
			})
		})

		// my_logger('returned_value', returned_value, 'function_returning', 'update_contact', 0)
		// return 

	} catch (err) {

		my_logger('err', err, 'error', 'update_contact', 0)


	}

	my_logger(null, null, 'function_exiting', 'update_contact', 0)
	
}


// ADD NUMBER TO AN EXISTING CONTACT
function add_number_to_contact(displayName, number){

	my_logger(null, null, 'function_entering', 'add_number_to_contact', 0)

	try{

		var newPerson = { 
			// recordID: recordID,
			displayName: displayName,
			phoneNumbers: [
				{
					label: 'mobile',
					number: number,
				},
			]
		}

		Contacts.editExistingContact(newPerson).then(contact => {
			//contact updated
		});
	
		// my_logger('returned_value', returned_value, 'function_returning', 'add_number_to_contact', 0)
		// return 

	} catch (err) {

		my_logger('err', err, 'error', 'add_number_to_contact', 0)

	}

	my_logger(null, null, 'function_exiting', 'add_number_to_contact', 0)
	
}


// DELETE CONTACT BY CONTACT ID
function delete_contact_with_id(){

	my_logger(null, null, 'function_entering', 'delete_contact_with_id', 0)

	try{

		Contacts.deleteContact({recordID: 1}).then(recordId => {
		  // contact deleted
		})
		
		// my_logger('returned_value', returned_value, 'function_returning', 'delete_contact_with_id', 0)
		// return 

	} catch (err) {

		my_logger('err', err, 'error', 'delete_contact_with_id', 0)


	}

	my_logger(null, null, 'function_exiting', 'delete_contact_with_id', 0)
	
}

// DELETE CONTACT BY CONTACT OBJECT
function delete_contact_through_object(){

	my_logger(null, null, 'function_entering', 'delete_contact_through_object', 0)

	try{

		Contacts.deleteContact(contact).then((recordId) => {
		  // contact deleted
		})

		// my_logger('returned_value', returned_value, 'function_returning', 'delete_contact_through_object', 0)
		// return 

	} catch (err) {

		my_logger('err', err, 'error', 'delete_contact_through_object', 0)


	}

	my_logger(null, null, 'function_exiting', 'delete_contact_through_object', 0)
	
}




// CHECK IF PERMISSIONS GIVEN THEN DO SOMETHING
function check_permission_and_do_something(){

	my_logger(null, null, 'function_entering', 'check_permission_and_do_something', 0)

	try{

		Contacts.checkPermission().then(permission => {
			// Contacts.PERMISSION_AUTHORIZED || Contacts.PERMISSION_UNDEFINED || Contacts.PERMISSION_DENIED
			if (permission === 'undefined') {
				Contacts.requestPermission().then(permission => {
					// ...
				})
			}
			if (permission === 'authorized') {
				// yay!
			}
			if (permission === 'denied') {
				// x.x
			}
		})
		
		// my_logger('returned_value', returned_value, 'function_returning', 'check_permission_and_do_something', 0)
		// return 

	} catch (err) {

		my_logger('err', err, 'error', 'check_permission_and_do_something', 0)


	}

	my_logger(null, null, 'function_exiting', 'check_permission_and_do_something', 0)
	
}



module.exports = {
	show_all_contacts_and_set_in_state,
	get_all_contacts_and_save_in_storage,
	request_contacts_permission_and_then_save_in_storage,
	add_new_contact,
	find_someone_in_contacts,
	update_contact,
	add_number_to_contact,
	delete_contact_with_id,
	delete_contact_through_object,
	check_permission_and_do_something,
	check_permission_and_save_contact,	
}