export class UpdateDTO {
  username: string;
  role: string;
  email: string;
  fullname: string;
  addresses: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
}
