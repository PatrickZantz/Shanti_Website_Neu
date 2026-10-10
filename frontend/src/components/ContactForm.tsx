

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

const schema = z.object({ name: z.string().min(2, "Bitte gib deinen Namen ein."), email: z.string().email("Bitte prüfe deine E-Mail-Adresse."), message: z.string().min(10, "Deine Nachricht darf gern etwas mehr erzählen.") });
type FormValues = z.infer<typeof schema>;

export function ContactForm({ subject = "Nachricht an Shanti Yoga", address: configured }: { subject?: string; address?: string }) {
  const [status, setStatus] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });
  function submit(values: FormValues) {
    const address = configured || import.meta.env.PUBLIC_CONTACT_EMAIL;
    if (!address) {
      setStatus("Die Kontaktadresse ist noch nicht eingerichtet (PUBLIC_CONTACT_EMAIL).");
      return;
    }
    const body = `Von: ${values.name} (${values.email})\n\n${values.message}`;
    window.location.href = `mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatus("Dein E-Mail-Programm sollte sich mit deiner Nachricht öffnen. Prüfe sie dort und sende sie ab.");
  }
  return <form className="contact-form" onSubmit={handleSubmit(submit)} noValidate>
    <label>Name<input {...register("name")} autoComplete="name" />{errors.name && <small role="alert">{errors.name.message}</small>}</label>
    <label>E-Mail<input {...register("email")} type="email" autoComplete="email" />{errors.email && <small role="alert">{errors.email.message}</small>}</label>
    <label>Deine Nachricht<textarea {...register("message")} rows={5} />{errors.message && <small role="alert">{errors.message.message}</small>}</label>
    <button className="button" type="submit">Nachricht vorbereiten</button>{status && <p role="status">{status}</p>}
  </form>;
}