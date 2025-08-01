// Sistema de notificações para candidaturas médicas
// Integração com Supabase Edge Functions para envio de emails

class DoctorNotificationSystem {
    constructor() {
        this.emailTemplates = {
            applicationReceived: {
                subject: 'TeleMed - Candidatura Recebida',
                template: `
                    <h2>Candidatura Recebida com Sucesso!</h2>
                    <p>Olá, Dr(a). {{doctorName}},</p>
                    <p>Sua candidatura para se tornar médico parceiro da TeleMed foi recebida com sucesso!</p>
                    
                    <h3>Próximos Passos:</h3>
                    <ol>
                        <li><strong>Análise Documental (3-5 dias):</strong> Nossa equipe verificará todos os documentos enviados</li>
                        <li><strong>Verificação no CRM:</strong> Consultaremos automaticamente a situação do seu CRM</li>
                        <li><strong>Validação de Diplomas:</strong> Conferiremos no e-MEC a validade do seu diploma</li>
                        <li><strong>Background Check:</strong> Verificaremos antecedentes profissionais</li>
                        <li><strong>Entrevista Online:</strong> Se aprovado na análise, você será convidado para uma entrevista</li>
                    </ol>
                    
                    <h3>Documentos Pendentes:</h3>
                    <p>Você receberá um email separado com instruções para envio dos seguintes documentos:</p>
                    <ul>
                        <li>CPF e RG digitalizados (frente e verso)</li>
                        <li>Carteira do CRM atualizada (frente e verso)</li>
                        <li>Diploma de Medicina</li>
                        <li>Comprovante de endereço (máximo 3 meses)</li>
                        <li>Certificados de especialização (se aplicável)</li>
                    </ul>
                    
                    <h3>Informações da Candidatura:</h3>
                    <ul>
                        <li><strong>CRM:</strong> {{crm}}/{{crmState}}</li>
                        <li><strong>Especialidades:</strong> {{specialties}}</li>
                        <li><strong>Data de Envio:</strong> {{submittedDate}}</li>
                        <li><strong>Protocolo:</strong> {{applicationId}}</li>
                    </ul>
                    
                    <p><strong>Prazo de Análise:</strong> Até 15 dias úteis</p>
                    
                    <h3>Contato:</h3>
                    <p>Em caso de dúvidas, entre em contato:</p>
                    <ul>
                        <li>📧 Email: medicos@telemed.com</li>
                        <li>📞 Telefone: (11) 9999-9999</li>
                        <li>💬 WhatsApp: (11) 9999-9999</li>
                    </ul>
                    
                    <p>Atenciosamente,<br>
                    Equipe TeleMed</p>
                `
            },
            
            applicationApproved: {
                subject: 'TeleMed - Candidatura Aprovada! 🎉',
                template: `
                    <h2>Parabéns! Sua Candidatura Foi Aprovada! 🎉</h2>
                    <p>Olá, Dr(a). {{doctorName}},</p>
                    <p>É com grande satisfação que informamos que sua candidatura foi <strong>APROVADA</strong>!</p>
                    
                    <h3>Próximos Passos Obrigatórios:</h3>
                    <ol>
                        <li><strong>Treinamento Obrigatório:</strong>
                            <ul>
                                <li>Uso da plataforma - Tutorial completo</li>
                                <li>Protocolos de atendimento - Específicos</li>
                                <li>Assinatura de contratos - Formalização</li>
                                <li>Configuração de perfil - Público na plataforma</li>
                            </ul>
                        </li>
                        <li><strong>Configuração Inicial:</strong>
                            <ul>
                                <li>Definir horários de disponibilidade</li>
                                <li>Configurar valores de consulta</li>
                                <li>Testar equipamentos (câmera, microfone, internet)</li>
                                <li>Preparar ambiente profissional</li>
                            </ul>
                        </li>
                    </ol>
                    
                    <h3>Informações Importantes:</h3>
                    <ul>
                        <li><strong>Login:</strong> Use o email {{email}} para acessar a plataforma</li>
                        <li><strong>Senha:</strong> A mesma que você cadastrou</li>
                        <li><strong>Acesso:</strong> <a href="https://telemed.com/auth.html">https://telemed.com/auth.html</a></li>
                        <li><strong>Treinamento:</strong> Agendado para os próximos 3 dias úteis</li>
                    </ul>
                    
                    <h3>Acompanhamento Contínuo:</h3>
                    <ul>
                        <li>Avaliações de pacientes - Monitoramento constante</li>
                        <li>Auditorias periódicas - Qualidade do atendimento</li>
                        <li>Educação continuada - Cursos obrigatórios</li>
                        <li>Renovação anual - Atualização de dados</li>
                    </ul>
                    
                    <p><strong>Bem-vindo à equipe TeleMed!</strong></p>
                    
                    <p>Atenciosamente,<br>
                    Equipe TeleMed</p>
                `
            },
            
            applicationRejected: {
                subject: 'TeleMed - Candidatura Não Aprovada',
                template: `
                    <h2>Candidatura Não Aprovada</h2>
                    <p>Olá, Dr(a). {{doctorName}},</p>
                    <p>Agradecemos seu interesse em se tornar médico parceiro da TeleMed.</p>
                    
                    <p>Após análise criteriosa de sua candidatura, informamos que ela não foi aprovada neste momento.</p>
                    
                    <h3>Motivo:</h3>
                    <p>{{rejectionReason}}</p>
                    
                    <h3>Possibilidade de Nova Candidatura:</h3>
                    <p>Você poderá enviar uma nova candidatura após 6 meses, desde que os requisitos pendentes sejam atendidos.</p>
                    
                    <h3>Recursos:</h3>
                    <p>Caso discorde desta decisão, você pode entrar em contato conosco em até 30 dias:</p>
                    <ul>
                        <li>📧 Email: recursos@telemed.com</li>
                        <li>📞 Telefone: (11) 9999-9999</li>
                        <li><strong>Protocolo:</strong> {{applicationId}}</li>
                    </ul>
                    
                    <p>Atenciosamente,<br>
                    Equipe TeleMed</p>
                `
            }
        };
    }

    // Enviar notificação de candidatura recebida
    async sendApplicationReceived(applicationData) {
        const template = this.emailTemplates.applicationReceived;
        const emailContent = this.replaceTemplateVariables(template.template, {
            doctorName: applicationData.full_name,
            crm: applicationData.crm,
            crmState: applicationData.crm_state,
            specialties: Array.isArray(applicationData.specialties) ? applicationData.specialties.join(', ') : 'N/A',
            submittedDate: new Date(applicationData.submitted_at).toLocaleDateString('pt-BR'),
            applicationId: applicationData.id.substring(0, 8).toUpperCase()
        });

        return await this.sendEmail(
            applicationData.email,
            template.subject,
            emailContent
        );
    }

    // Enviar notificação de candidatura aprovada
    async sendApplicationApproved(applicationData) {
        const template = this.emailTemplates.applicationApproved;
        const emailContent = this.replaceTemplateVariables(template.template, {
            doctorName: applicationData.full_name,
            email: applicationData.email
        });

        return await this.sendEmail(
            applicationData.email,
            template.subject,
            emailContent
        );
    }

    // Enviar notificação de candidatura rejeitada
    async sendApplicationRejected(applicationData, rejectionReason) {
        const template = this.emailTemplates.applicationRejected;
        const emailContent = this.replaceTemplateVariables(template.template, {
            doctorName: applicationData.full_name,
            rejectionReason: rejectionReason || 'Não especificado',
            applicationId: applicationData.id.substring(0, 8).toUpperCase()
        });

        return await this.sendEmail(
            applicationData.email,
            template.subject,
            emailContent
        );
    }

    // Substituir variáveis no template
    replaceTemplateVariables(template, variables) {
        let content = template;
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            content = content.replace(regex, value);
        }
        return content;
    }

    // Enviar email (integração com Supabase Edge Function)
    async sendEmail(to, subject, htmlContent) {
        try {
            // Em produção, isso seria uma Edge Function do Supabase
            // Por enquanto, vamos simular o envio
            console.log('Enviando email:', {
                to,
                subject,
                htmlContent: htmlContent.substring(0, 100) + '...'
            });

            // Simular delay de envio
            await new Promise(resolve => setTimeout(resolve, 1000));

            return { success: true, message: 'Email enviado com sucesso' };
        } catch (error) {
            console.error('Erro ao enviar email:', error);
            return { success: false, error: error.message };
        }
    }

    // Enviar notificação WhatsApp (integração futura)
    async sendWhatsAppNotification(phone, message) {
        try {
            // Integração com WhatsApp API seria implementada aqui
            console.log('Enviando WhatsApp para:', phone, message.substring(0, 50) + '...');
            
            return { success: true, message: 'WhatsApp enviado com sucesso' };
        } catch (error) {
            console.error('Erro ao enviar WhatsApp:', error);
            return { success: false, error: error.message };
        }
    }
}

// Instância global do sistema de notificações
const doctorNotifications = new DoctorNotificationSystem();

// Exportar para uso em outros arquivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DoctorNotificationSystem;
}