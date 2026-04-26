import email from "infra/email.js";
import orchestrator from "infra/scripts/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.deleteAllEmails();
});

describe("infra/email.js", () => {
  test("send()", async () => {
    await email.send({
      from: "CloneTabnews <contato@paulodev.com.br>",
      to: "<pauloguilherme613@gmail.com>",
      subject: "Teste de assunto2",
      text: "Teste de corpo.",
    });

    await email.send({
      from: "CloneTabnews <contato@paulodev.com.br>",
      to: "<pauloguilherme613@gmail.com>",
      subject: "Ultimo email enviado",
      text: "Teste de ultimo email enviado.",
    });

    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<contato@paulodev.com.br>");
    expect(lastEmail.recipients[0]).toBe("<pauloguilherme613@gmail.com>");
    expect(lastEmail.subject).toBe("Ultimo email enviado");
    expect(lastEmail.text).toBe("Teste de ultimo email enviado.\n");
  });
});
