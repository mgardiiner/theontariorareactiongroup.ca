import nodemailer from 'nodemailer'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { firstName, lastName, email, role, topic, message } = body

  if (!firstName || !lastName || !email || !message) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  await transporter.sendMail({
    from: `"Ontario Rare Action Group" <${process.env.SMTP_USER}>`,
    to: 'contact@theontariorareactiongroup.ca',
    replyTo: email,
    subject: 'Website Contact Form Submission',
    text: [
      `Name: ${firstName} ${lastName}`,
      `Email: ${email}`,
      `Role: ${role || '—'}`,
      `Topic: ${topic || '—'}`,
      ``,
      message,
    ].join('\n'),
    html: `
      <p><strong>Name:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      <p><strong>Role:</strong> ${role || '—'}</p>
      <p><strong>Topic:</strong> ${topic || '—'}</p>
      <hr/>
      <p>${message.replace(/\n/g, '<br/>')}</p>
    `,
  })

  return { ok: true }
})
