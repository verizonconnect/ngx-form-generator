import { FormGroup, FormControl, Validators } from '@angular/forms';

export const orderForm = new FormGroup({
  id: new FormControl(null, []),
  petId: new FormControl(null, []),
  quantity: new FormControl(null, []),
  shipDate: new FormControl(null, []),
  status: new FormControl(null, []),
  complete: new FormControl(null, [])
});

export const customerForm = new FormGroup({
  id: new FormControl(null, []),
  username: new FormControl(null, []),
  address: new FormControl(null, [])
});

export const addressForm = new FormGroup({
  street: new FormControl(null, []),
  city: new FormControl(null, []),
  state: new FormControl(null, []),
  zip: new FormControl(null, [])
});

export const categoryForm = new FormGroup({
  id: new FormControl(null, []),
  name: new FormControl(null, [])
});

export const userForm = new FormGroup({
  id: new FormControl(null, []),
  username: new FormControl(null, []),
  firstName: new FormControl(null, []),
  lastName: new FormControl(null, []),
  email: new FormControl(null, []),
  password: new FormControl(null, []),
  phone: new FormControl(null, []),
  userStatus: new FormControl(null, [])
});

export const tagForm = new FormGroup({
  id: new FormControl(null, []),
  name: new FormControl(null, [])
});

export const petForm = new FormGroup({
  id: new FormControl(null, []),
  name: new FormControl(null, [Validators.required]),
  category: new FormControl(null, []),
  photoUrls: new FormControl(null, [Validators.required]),
  tags: new FormControl(null, []),
  status: new FormControl(null, [])
});

export const apiResponseForm = new FormGroup({
  code: new FormControl(null, []),
  type: new FormControl(null, []),
  message: new FormControl(null, [])
});
