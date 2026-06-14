export type CustomerProfile = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type AddressRecord = {
  id: string;
  title: string;
  firstName: string;
  isBusiness?: boolean;
  lastName: string;
  country: string;
  state: string;
  city: string;
  postcode: string;
  address1: string;
  address2: string;
  email: string;
  phone: string;
  company: string;
  taxId?: string;
  isDefault?: boolean;
};
