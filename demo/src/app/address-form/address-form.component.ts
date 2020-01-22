import { Component } from '@angular/core';
import { addressModelForm } from 'forms';

@Component({
  selector: 'app-address-form',
  templateUrl: './address-form.component.html',
  styleUrls: ['./address-form.component.scss']
})
export class AddressFormComponent {
  addressForm = addressModelForm;

  onSubmit() {
    alert('Thanks!');
  }
}
