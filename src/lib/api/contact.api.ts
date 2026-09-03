import { client, unwrap } from "./client";

export interface ContactFormData {
  name: string;
  email: string;
  organization?: string;
  category: string;
  message: string;
}

export const contactApi = {
  submit: async (data: ContactFormData) => {
    const res = await client.post<{ data: { message: string } }>("/contact", data);
    return unwrap(res);
  },
};