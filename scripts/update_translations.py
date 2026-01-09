#!/usr/bin/env python3
"""
Script to add missing translation keys to all language files
"""
import json
import os

# Base path for i18n locales
LOCALES_PATH = 'src/i18n/locales'

# Define missing keys with their translations per language
TRANSLATION_KEYS = {
    'common': {
        'submit': {
            'en': 'Submit',
            'fr': 'Soumettre',
            'ar': 'إرسال',
            'de': 'Einreichen',
            'es': 'Enviar',
            'hi': 'जमा करें',
            'zh': '提交'
        },
        'invalidAmount': {
            'en': 'Invalid amount',
            'fr': 'Montant invalide',
            'ar': 'مبلغ غير صالح',
            'de': 'Ungültiger Betrag',
            'es': 'Monto inválido',
            'hi': 'अमान्य रा शि',
            'zh': '金额无效'
        }
    },
    'employees': {
        'alias': {
            'en': 'Alias',
            'fr': 'Alias',
            'ar': 'الاسم المستعار',
            'de': 'Alias',
            'es': 'Alias',
            'hi': 'उपनाम',
            'zh': '别名'
        },
        'aliasPlaceholder': {
            'en': 'e.g., John D.',
            'fr': 'ex: Jean D.',
            'ar': 'على سبيل المثال، أحمد س.',
            'de': 'z.B. Hans M.',
            'es': 'p.ej., Juan D.',
            'hi': 'उदाहरण, जॉन डी.',
            'zh': '例如，张三'
        },
        'birthDate': {
            'en': 'Date of Birth',
            'fr': 'Date de naissance',
            'ar': 'تاريخ الميلاد',
            'de': 'Geburtsdatum',
            'es':'Fecha de nacimiento',
            'hi': 'जन्म तिथि',
            'zh': '出生日期'
        },
        'birthDatePlaceholder': {
            'en': 'YYYY-MM-DD',
            'fr': 'AAAA-MM-JJ',
            'ar': 'سنة-شهر-يوم',
            'de': 'JJJJ-MM-TT',
            'es': 'AAAA-MM-DD',
            'hi': 'वर्ष-माह-दिन',
            'zh': '年-月-日'
        },
        'countryPlaceholder': {
            'en': 'e.g., USA',
            'fr': 'ex: France',
            'ar': 'على سبيل المثال، مصر',
            'de': 'z.B. Deutschland',
            'es': 'p.ej., España',
            'hi': 'उदाहरण, भारत',
            'zh': '例如，中国'
        },
        'jobTitle': {
            'en': 'Job Title',
            'fr': 'Titre du poste',
            'ar': 'المسمى الوظيفي',
            'de': 'Berufsbezeichnung',
            'es': 'Título del trabajo',
            'hi': 'नौकरी का शीर्षक',
            'zh': '职位'
        },
        'jobTitlePlaceholder': {
            'en': 'e.g., Software Engineer',
            'fr': 'ex: Ingénieur logiciel',
            'ar': 'على سبيل المثال، مهندس برمجيات',
            'de': 'z.B. Software-Ingenieur',
            'es': 'p.ej., Ingeniero de Software',
            'hi': 'उदाहरण, सॉफ्टवेयर इंजीनियर',
            'zh': '例如，软件工程师'
        }
    },
    'illnesses': {
        'dateOfIllness': {
            'en': 'Date of Illness',
            'fr': 'Date de la maladie',
            'ar': 'تاريخ المرض',
            'de': 'Datum der Krankheit',
            'es': 'Fecha de enfermedad',
            'hi': 'बीमारी की तारीख',
            'zh': '疾病日期'
        },
        'daysCount': {
            'en': '{{count}} day',
            'fr': '{{count}} jour',
            'ar': '{{count}} يوم',
            'de': '{{count}} Tag',
            'es': '{{count}} día',
            'hi': '{{count}} दिन',
            'zh': '{{count}} 天'
        },
        'daysCount_plural': {
            'en': '{{count}} days',
            'fr': '{{count}} jours',
            'ar': '{{count}} أيام',
            'de': '{{count}} Tage',
            'es': '{{count}} días',
            'hi': '{{count}} दिन',
            'zh': '{{count}} 天'
        },
        'endDate': {
            'en': 'End Date',
            'fr': 'Date de fin',
            'ar': 'تاريخ الانتهاء',
            'de': 'Enddatum',
            'es': 'Fecha de finalización',
            'hi': 'समाप्ति तिथि',
            'zh': '结束日期'
        },
        'endDateLabel': {
            'en': 'End Date',
            'fr': 'Date de fin',
            'ar': 'تاريخ الانتهاء',
            'de': 'Enddatum',
            'es': 'Fecha de finalización',
            'hi': 'समाप्ति तिथि',
            'zh': '结束日期'
        },
        'object': {
            'en': 'Subject',
            'fr': 'Objet',
            'ar': 'الموضوع',
            'de': 'Betreff',
            'es': 'Asunto',
            'hi': 'विषय',
            'zh': '主题'
        },
        'objectPlaceholder': {
            'en': 'e.g., Medical Leave',
            'fr': 'ex: Congé médical',
            'ar': 'على سبيل المثال، إجازة مرضية',
            'de': 'z.B. Krankenurlaub',
            'es': 'p.ej., Licencia médica',
            'hi': 'उदाहरण, चिकित्सा अवकाश',
           'zh': '例如，病假'
        }
    },
    'leaves': {
        'cause': {
            'en': 'Cause/Reason',
            'fr': 'Cause/Raison',
            'ar': 'السبب',
            'de': 'Grund',
            'es': 'Causa/Razón',
            'hi': 'कारण',
            'zh': '原因'
        },
        'causePlaceholder': {
            'en': 'e.g., Personal reasons',
            'fr': 'ex: Raisons personnelles',
            'ar': 'على سبيل المثال، أسباب شخصية',
            'de': 'z.B. Persönliche Gründe',
            'es': 'p.ej., Razones personales',
            'hi': 'उदाहरण, व्यक्तिगत कारण',
            'zh': '例如，个人原因'
        },
        'object': {
            'en': 'Subject',
            'fr': 'Objet',
            'ar': 'الموضوع',
            'de': 'Betreff',
            'es': 'Asunto',
            'hi': 'विषय',
            'zh': '主题'
        },
        'objectPlaceholder': {
            'en': 'e.g., Annual Leave',
            'fr': 'ex: Congé annuel',
            'ar': 'على سبيل المثال، إجازة سنوية',
            'de': 'z.B. Jahresurlaub',
            'es': 'p.ej., Licencia anual',
            'hi': 'उदाहरण, वार्षिक अवकाश',
            'zh': '例如，年假'
        },
        'status': {
            'en': 'Status',
            'fr': 'Statut',
            'ar': 'الحالة',
            'de': 'Status',
            'es': 'Estado',
            'hi': 'स्थिति',
            'zh': '状态'
        }
    },
    'navigation': {
        'chatBot': {
            'en': 'AI Assistant',
            'fr': 'Assistant IA',
            'ar': 'مساعد الذكاء الاصطناعي',
            'de': 'KI-Assistent',
            'es': 'Asistente IA',
            'hi': 'एआई सहायक',
            'zh': 'AI助手'
        },
        'manageNotifications': {
            'en': 'Manage Notifications',
            'fr': 'Gérer les notifications',
            'ar': 'إدارة الإشعارات',
            'de': 'Benachrichtigungen verwalten',
            'es': 'Gestionar notificaciones',
            'hi': 'सूचनाएं प्रबंधित करें',
            'zh': '管理通知'
        },
        'personalInfo': {
            'en': 'Personal Information',
            'fr': 'Informations personnelles',
            'ar': 'المعلومات الشخصية',
            'de': 'Persönliche Informationen',
            'es': 'Información personal',
            'hi': 'व्यक्तिगत जानकारी',
            'zh': '个人信息'
        }
    },
    'notifications': {
        'manageNotifications': {
            'en': 'Manage Notifications',
            'fr': 'Gérer les notifications',
            'ar': 'إدارة الإشعارات',
            'de': 'Benachrichtigungen verwalten',
            'es': 'Gestionar notificaciones',
            'hi': 'सूचनाएं प्रबंधित करें',
            'zh': '管理通知'
        },
        'sendToAll': {
            'en': 'Send to All Employees',
            'fr': 'Envoyer à tous les employés',
            'ar': 'إرسال إلى جميع الموظفين',
            'de': 'An alle Mitarbeiter senden',
            'es': 'Enviar a todos los empleados',
            'hi': 'सभी कर्मचारियों को भेजें',
            'zh': '发送给所有员工'
        },
        'sendToCompany': {
            'en': 'Send to Company',
            'fr': "Envoyer à l'entreprise",
            'ar': 'إرسال إلى الشركة',
            'de': 'An Unternehmen senden',
            'es': 'Enviar a la empresa',
            'hi': 'कंपनी को भेजें',
            'zh': '发送给公司'
        },
        'sendToTeam': {
            'en': 'Send to Team',
            'fr': "Envoyer à l'équipe",
            'ar': 'إرسال إلى الفريق',
            'de': 'An Team senden',
            'es': 'Enviar al equipo',
            'hi': 'टीम को भेजें',
            'zh': '发送给团队'
        },
        'welcomeTitle': {
            'en': 'Welcome to RH Management!',
            'fr': 'Bienvenue sur RH Management !',
            'ar': 'مرحبًا بك في إدارة الموارد البشرية!',
            'de': 'Willkommen bei RH Management!',
            'es': '¡Bienvenido a RH Management!',
            'hi': 'आरएच प्रबंधन में आपका स्वागत है!',
            'zh': '欢迎使用人力资源管理系统！'
        },
        'welcomeMessage': {
            'en': 'Your comprehensive HR management solution. Manage employees, leaves, payroll, and more - all in one place.',
            'fr': 'Votre solution complète de gestion des ressources humaines. Gérez les employés, congés, paie et plus encore - le tout en un seul endroit.',
            'ar': 'حل إدارة الموارد البشرية الشامل الخاص بك. إدارة الموظفين والإجازات والرواتب والمزيد - كل ذلك في مكان واحد.',
            'de': 'Ihre umfassende HR-Management-Lösung. Verwalten Sie Mitarbeiter, Urlaube, Gehaltsabrechnungen und mehr - alles an einem Ort.',
            'es': 'Su solución integral de gestión de RRHH. Gestione empleados, licencias, nóminas y más, todo en un solo lugar.',
            'hi': 'आपका व्यापक एचआर प्रबंधन समाधान। कर्मचारियों, अवकाश, वेतन और अधिक का प्रबंधन करें - सब एक ही स्थान पर।',
            'zh': '您的全面人力资源管理解决方案。管理员工、假期、工资等 - 一站式服务。'
        }
    },
    'roles': {
        'undefined': {
            'en': 'Undefined Role',
            'fr': 'Rôle non défini',
            'ar': 'دور غير محدد',
            'de': 'Undefinierte Rolle',
            'es': 'Rol indefinido',
            'hi': 'अपरिभाषित भूमिका',
            'zh': '未定义角色'
        }
    },
    'settings': {
        'companySettings': {
            'en': 'Company Settings',
            'fr': "Paramètres de l'entreprise",
            'ar': 'إعدادات الشركة',
            'de': 'Unternehmenseinstellungen',
            'es': 'Configuración de la empresa',
            'hi': 'कंपनी सेटिंग्स',
            'zh': '公司设置'
        }
    },
    'teams': {
        'selectedCount': {
            'en': '{{count}} employee selected',
            'fr': '{{count}} employé sélectionné',
            'ar': 'تم اختيار {{count}} موظف',
            'de': '{{count}} Mitarbeiter ausgewählt',
            'es': '{{count}} empleado seleccionado',
            'hi': '{{count}} कर्मचारी चयनित',
            'zh': '已选择 {{count}} 名员工'
        },
        'selectedCount_plural': {
            'en': '{{count}} employees selected',
            'fr': '{{count}} employés sélectionnés',
           'ar': 'تم اختيار {{count}} موظفين',
            'de': '{{count}} Mitarbeiter ausgewählt',
            'es': '{{count}} empleados seleccionados',
            'hi': '{{count}} कर्मचारी चयनित',
            'zh': '已选择 {{count}} 名员工'
        }
    },
    'teams.validation': {
        'noMembers': {
            'en': 'No members selected',
            'fr': 'Aucun membre sélectionné',
            'ar': 'لم يتم اختيار أعضاء',
            'de': 'Keine Mitglieder ausgewählt',
            'es': 'No se seleccionaron miembros',
            'hi': 'कोई सदस्य चयनित नहीं',
            'zh': '未选择成员'
        }
    }
}

def update_translation_file(lang_code):
    """Update a single translation file with missing keys"""
    file_path = os.path.join(LOCALES_PATH, f'{lang_code}.json')
    
    print(f'Processing {lang_code}.json...')
    
    # Read the file
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Add missing keys
    for section, keys in TRANSLATION_KEYS.items():
        # Handle nested sections like 'teams.validation'
        if '.' in section:
            parts = section.split('.')
            if parts[0] not in data:
                data[parts[0]] = {}
            if parts[1] not in data[parts[0]]:
                data[parts[0]][parts[1]] = {}
            target = data[parts[0]][parts[1]]
        else:
            if section not in data:
                data[section] = {}
            target = data[section]
        
        # Add each key if it doesn't exist
        for key, translations in keys.items():
            if key not in target and lang_code in translations:
                target[key] = translations[lang_code]
                print(f'  Added {section}.{key}')
    
    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f'✓ {lang_code}.json updated successfully\n')

def main():
    """Main function to update all translation files"""
    languages = ['ar', 'de', 'es', 'hi', 'zh']
    
    for lang in languages:
        update_translation_file(lang)
    
    print('All translation files updated successfully!')

if __name__ == '__main__':
    main()
