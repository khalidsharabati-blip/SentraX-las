export interface ContractSection {
  title: string;
  content: string;
}

export interface ContractTemplate {
  id: string;
  name: { ar: string; he: string; en: string };
  sections: {
    ar: ContractSection[];
    he: ContractSection[];
    en: ContractSection[];
  };
}

export function getTemplateName(t: ContractTemplate, locale: string): string {
  return t.name[locale as keyof typeof t.name] || t.name.ar;
}

export function getTemplateSections(t: ContractTemplate, locale: string): ContractSection[] {
  return t.sections[locale as keyof typeof t.sections] || t.sections.ar;
}

export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: "maintenance-standard",
    name: {
      ar: "عقد صيانة دورية - قياسي",
      he: "חוזה תחזוקה שוטפת - סטנדרטי",
      en: "Standard Periodic Maintenance Contract",
    },
    sections: {
      ar: [
        {
          title: "مقدمة العقد",
          content: `تم الاتفاق بين كل من:

الطرف الأول (مزود الخدمة): شركة {{companyName}}
العنوان: {{companyAddress}}
هاتف: {{companyPhone}}

الطرف الثاني (العميل): {{customerName}}
الشركة: {{customerCompany}}
العنوان: {{customerAddress}}
هاتف: {{customerPhone}}

على البنود والشروط التالية:`,
        },
        {
          title: "موضوع العقد",
          content: `يلتزم الطرف الأول بتقديم خدمات الصيانة الدورية لأنظمة الأمان والحماية المثبتة في موقع العميل (المشروع: {{projectName}}) وتشمل:
• أنظمة كاميرات المراقبة (CCTV)
• أنظمة إنذار الحريق
• أنظمة كشف التسلل والاقتحام
• أنظمة التحكم بالدخول
• أنظمة الاتصال الداخلي (إنتركوم)
• البنية التحتية للشبكات المرتبطة`,
        },
        {
          title: "مدة العقد",
          content: `يبدأ هذا العقد من تاريخ {{startDate}} وينتهي بتاريخ {{endDate}}.
يتجدد العقد تلقائياً لفترة مماثلة ما لم يُخطر أحد الطرفين الآخر كتابياً قبل 30 يوماً من تاريخ الانتهاء.`,
        },
        {
          title: "الزيارات الدورية",
          content: `يلتزم الطرف الأول بإجراء {{visitsPerYear}} زيارات صيانة دورية سنوياً تشمل:
• فحص شامل لجميع الأجهزة والمعدات
• تنظيف الكاميرات والحساسات
• فحص التوصيلات والكابلات
• تحديث البرمجيات عند الحاجة
• فحص البطاريات الاحتياطية
• إعداد تقرير فني مفصل بعد كل زيارة
• تقديم توصيات للتحسين إن وجدت`,
        },
        {
          title: "القيمة المالية",
          content: `القيمة السنوية لهذا العقد: {{annualPrice}} شيكل (شامل ضريبة القيمة المضافة).
تُدفع على {{paymentTerms}}.
لا تشمل قيمة العقد قطع الغيار والمواد الاستهلاكية التي تُحتسب بشكل منفصل.`,
        },
        {
          title: "الاستجابة للطوارئ",
          content: `• يلتزم الطرف الأول بالاستجابة لطلبات الطوارئ خلال 4 ساعات عمل.
• الزيارات الطارئة خارج ساعات العمل تُحتسب بتكلفة إضافية حسب الاتفاق.
• يتوفر خط طوارئ على مدار 24 ساعة للاستشارة الهاتفية.`,
        },
        {
          title: "التزامات الطرف الأول",
          content: `• تنفيذ أعمال الصيانة بمهنية عالية وفق المعايير المعتمدة.
• توفير فنيين مؤهلين ومدربين.
• الحفاظ على سرية معلومات العميل.
• تقديم تقارير دورية عن حالة الأنظمة.
• إخطار العميل فوراً بأي خلل أو مشكلة تتطلب تدخل عاجل.`,
        },
        {
          title: "التزامات الطرف الثاني",
          content: `• توفير وصول آمن وميسر للفنيين إلى الموقع.
• إبلاغ الطرف الأول فوراً بأي عطل أو خلل.
• عدم العبث بالأنظمة أو تعديلها دون إذن مسبق.
• سداد المستحقات المالية في مواعيدها.`,
        },
        {
          title: "الضمان والمسؤولية",
          content: `• يضمن الطرف الأول جودة أعمال الصيانة المنفذة لمدة 30 يوماً من تاريخ كل زيارة.
• لا يتحمل الطرف الأول مسؤولية الأعطال الناتجة عن سوء الاستخدام أو الكوارث الطبيعية أو تدخل طرف ثالث.
• قطع الغيار المستبدلة تخضع لضمان المصنّع.`,
        },
        {
          title: "الإنهاء والفسخ",
          content: `• يحق لأي طرف إنهاء العقد بإشعار كتابي مدته 30 يوماً.
• في حال الإنهاء المبكر، يُسترد المبلغ المتبقي بالتناسب مع الفترة غير المستخدمة.
• يحق للطرف المتضرر فسخ العقد فوراً في حال إخلال الطرف الآخر بالتزاماته الجوهرية.`,
        },
        {
          title: "أحكام عامة",
          content: `• يخضع هذا العقد للقوانين المعمول بها.
• أي نزاع يُحل ودياً أولاً، وفي حال عدم التوصل لحل يُحال للجهات المختصة.
• لا يجوز التنازل عن هذا العقد لطرف ثالث دون موافقة كتابية.

حُرر هذا العقد من نسختين لكل طرف نسخة.

الطرف الأول: ___________________     التاريخ: {{signDate}}
الطرف الثاني: ___________________    التاريخ: {{signDate}}`,
        },
      ],
      he: [
        {
          title: "מבוא לחוזה",
          content: `הוסכם בין הצדדים:

צד א' (נותן השירות): חברת {{companyName}}
כתובת: {{companyAddress}}
טלפון: {{companyPhone}}

צד ב' (הלקוח): {{customerName}}
חברה: {{customerCompany}}
כתובת: {{customerAddress}}
טלפון: {{customerPhone}}

על התנאים וההוראות הבאים:`,
        },
        {
          title: "נושא החוזה",
          content: `צד א' מתחייב לספק שירותי תחזוקה שוטפת למערכות הביטחון והבטיחות המותקנות באתר הלקוח (פרויקט: {{projectName}}) הכוללות:
• מערכות מצלמות אבטחה (CCTV)
• מערכות גילוי אש
• מערכות גילוי פריצה
• מערכות בקרת כניסה
• מערכות אינטרקום
• תשתיות רשת קשורות`,
        },
        {
          title: "תקופת החוזה",
          content: `חוזה זה מתחיל מתאריך {{startDate}} ומסתיים בתאריך {{endDate}}.
החוזה יתחדש אוטומטית לתקופה זהה אלא אם אחד הצדדים יודיע בכתב 30 יום לפני תום התקופה.`,
        },
        {
          title: "ביקורים תקופתיים",
          content: `צד א' מתחייב לבצע {{visitsPerYear}} ביקורי תחזוקה מתוכננים בשנה הכוללים:
• בדיקה מקיפה של כל המכשירים והציוד
• ניקוי מצלמות וחיישנים
• בדיקת חיבורים וכבלים
• עדכון תוכנה לפי הצורך
• בדיקת סוללות גיבוי
• הכנת דוח טכני מפורט לאחר כל ביקור
• מתן המלצות לשיפור במידת הצורך`,
        },
        {
          title: "ערך כספי",
          content: `הערך השנתי של חוזה זה: {{annualPrice}} ש"ח (כולל מע"מ).
תשלום ב{{paymentTerms}}.
מחיר החוזה אינו כולל חלקי חילוף וחומרים מתכלים אשר יחושבו בנפרד.`,
        },
        {
          title: "תגובה לחירום",
          content: `• צד א' מתחייב להגיב לבקשות חירום תוך 4 שעות עבודה.
• ביקורי חירום מחוץ לשעות העבודה יחויבו בעלות נוספת בהתאם להסכמה.
• קו חירום זמין 24 שעות ביממה לייעוץ טלפוני.`,
        },
        {
          title: "התחייבויות צד א'",
          content: `• ביצוע עבודות תחזוקה ברמה מקצועית גבוהה בהתאם לתקנים המאושרים.
• אספקת טכנאים מוסמכים ומיומנים.
• שמירה על סודיות מידע הלקוח.
• מתן דוחות תקופתיים על מצב המערכות.
• הודעה מיידית ללקוח על כל תקלה הדורשת טיפול דחוף.`,
        },
        {
          title: "התחייבויות צד ב'",
          content: `• מתן גישה בטוחה ונוחה לטכנאים לאתר.
• דיווח מיידי לצד א' על כל תקלה.
• אי שינוי או התערבות במערכות ללא אישור מראש.
• תשלום בזמן של כל החיובים הכספיים.`,
        },
        {
          title: "אחריות",
          content: `• צד א' מתחייב לאיכות עבודות התחזוקה למשך 30 יום מתאריך כל ביקור.
• צד א' אינו אחראי לתקלות הנובעות משימוש לא נכון, אסונות טבע או התערבות צד שלישי.
• חלקי חילוף מוחלפים כפופים לאחריות היצרן.`,
        },
        {
          title: "סיום וביטול",
          content: `• כל צד רשאי לסיים את החוזה בהודעה בכתב של 30 יום.
• במקרה של סיום מוקדם, יוחזר הסכום הנותר באופן יחסי לתקופה שלא נוצלה.
• הצד הנפגע רשאי לבטל את החוזה מיד במקרה של הפרה מהותית.`,
        },
        {
          title: "הוראות כלליות",
          content: `• חוזה זה כפוף לחוקים החלים.
• כל סכסוך ייפתר תחילה בדרכי שלום, ובמקרה של אי הסכמה יועבר לגורמים המוסמכים.
• אין להעביר חוזה זה לצד שלישי ללא הסכמה בכתב.

חוזה זה נערך בשני עותקים, עותק לכל צד.

צד א': ___________________     תאריך: {{signDate}}
צד ב': ___________________     תאריך: {{signDate}}`,
        },
      ],
      en: [
        {
          title: "Contract Introduction",
          content: `This agreement is made between:

First Party (Service Provider): {{companyName}}
Address: {{companyAddress}}
Phone: {{companyPhone}}

Second Party (Client): {{customerName}}
Company: {{customerCompany}}
Address: {{customerAddress}}
Phone: {{customerPhone}}

Under the following terms and conditions:`,
        },
        {
          title: "Subject of Contract",
          content: `The First Party commits to providing periodic maintenance services for the security and safety systems installed at the client's site (Project: {{projectName}}) including:
• CCTV surveillance systems
• Fire alarm systems
• Intrusion detection systems
• Access control systems
• Intercom systems
• Related network infrastructure`,
        },
        {
          title: "Contract Duration",
          content: `This contract starts on {{startDate}} and ends on {{endDate}}.
The contract shall automatically renew for an equivalent period unless either party provides written notice 30 days before the expiration date.`,
        },
        {
          title: "Periodic Visits",
          content: `The First Party commits to performing {{visitsPerYear}} scheduled maintenance visits per year including:
• Comprehensive inspection of all devices and equipment
• Cleaning of cameras and sensors
• Inspection of connections and cables
• Software updates as needed
• Backup battery testing
• Preparation of a detailed technical report after each visit
• Providing improvement recommendations when applicable`,
        },
        {
          title: "Financial Value",
          content: `The annual value of this contract: {{annualPrice}} ILS (including VAT).
Payable in {{paymentTerms}}.
The contract value does not include spare parts and consumable materials, which are charged separately.`,
        },
        {
          title: "Emergency Response",
          content: `• The First Party commits to responding to emergency requests within 4 business hours.
• Emergency visits outside business hours are charged at an additional cost as agreed.
• A 24-hour emergency hotline is available for telephone consultation.`,
        },
        {
          title: "First Party Obligations",
          content: `• Performing maintenance work with high professionalism according to approved standards.
• Providing qualified and trained technicians.
• Maintaining confidentiality of client information.
• Providing periodic reports on system status.
• Immediately notifying the client of any malfunction requiring urgent intervention.`,
        },
        {
          title: "Second Party Obligations",
          content: `• Providing safe and accessible entry for technicians to the site.
• Immediately reporting any malfunction to the First Party.
• Not tampering with or modifying systems without prior authorization.
• Paying financial obligations on schedule.`,
        },
        {
          title: "Warranty and Liability",
          content: `• The First Party guarantees the quality of maintenance work for 30 days from each visit date.
• The First Party is not liable for malfunctions caused by misuse, natural disasters, or third-party interference.
• Replaced spare parts are subject to manufacturer warranty.`,
        },
        {
          title: "Termination",
          content: `• Either party may terminate the contract with 30 days written notice.
• In case of early termination, the remaining amount shall be refunded proportionally.
• The affected party may immediately terminate the contract in case of material breach.`,
        },
        {
          title: "General Provisions",
          content: `• This contract is subject to applicable laws.
• Any dispute shall first be resolved amicably; if no resolution is reached, it shall be referred to competent authorities.
• This contract may not be assigned to a third party without written consent.

This contract is prepared in two copies, one for each party.

First Party: ___________________     Date: {{signDate}}
Second Party: ___________________    Date: {{signDate}}`,
        },
      ],
    },
  },
  {
    id: "maintenance-comprehensive",
    name: {
      ar: "عقد صيانة شاملة - بريميوم",
      he: "חוזה תחזוקה מקיפה - פרימיום",
      en: "Comprehensive Maintenance Contract - Premium",
    },
    sections: {
      ar: [
        {
          title: "مقدمة العقد",
          content: `عقد صيانة شاملة رقم: {{contractNumber}}

بين شركة {{companyName}} (الطرف الأول / مزود الخدمة)
و {{customerName}} - {{customerCompany}} (الطرف الثاني / العميل)

الموقع: {{projectName}}
تاريخ التوقيع: {{signDate}}`,
        },
        {
          title: "نطاق الخدمات الشاملة",
          content: `يشمل هذا العقد جميع خدمات الصيانة الوقائية والتصحيحية:

أ. صيانة وقائية (دورية):
• {{visitsPerYear}} زيارات صيانة مجدولة سنوياً
• فحص شامل لجميع المكونات
• تنظيف واختبار الأجهزة
• تحديث البرمجيات والأنظمة
• معايرة الكاميرات والحساسات

ب. صيانة تصحيحية (إصلاحية):
• إصلاح الأعطال بدون تكلفة إضافية (باستثناء قطع الغيار)
• استبدال المكونات التالفة
• إعادة برمجة الأنظمة عند الحاجة

ج. دعم فني:
• دعم هاتفي على مدار الساعة
• دعم عن بُعد عبر الإنترنت
• استجابة للطوارئ خلال ساعتين`,
        },
        {
          title: "المدة والتجديد",
          content: `مدة العقد: من {{startDate}} حتى {{endDate}}
التجديد: تلقائي لمدة مماثلة
الإلغاء: بإشعار كتابي قبل 60 يوماً من الانتهاء`,
        },
        {
          title: "القيمة وشروط الدفع",
          content: `القيمة السنوية: {{annualPrice}} شيكل (+ ض.ق.م 17%)
طريقة الدفع: {{paymentTerms}}

يشمل السعر:
✓ جميع الزيارات الدورية
✓ الإصلاحات الطارئة (عمالة فقط)
✓ الدعم الفني عن بُعد
✓ التقارير الدورية

لا يشمل:
✗ قطع الغيار والمعدات البديلة
✗ أعمال التوسعة والتركيبات الجديدة
✗ أضرار الكوارث الطبيعية`,
        },
        {
          title: "مستوى الخدمة (SLA)",
          content: `| الأولوية | زمن الاستجابة | زمن الحل |
|----------|---------------|----------|
| حرجة     | ساعتان        | 8 ساعات  |
| عالية    | 4 ساعات       | 24 ساعة  |
| متوسطة   | 8 ساعات       | 48 ساعة  |
| منخفضة   | يوم عمل       | 5 أيام   |

• نسبة تشغيل مضمونة: 99%
• تعويض في حال عدم الالتزام: خصم 5% من القسط الشهري لكل يوم تأخير`,
        },
        {
          title: "التقارير والتوثيق",
          content: `يلتزم الطرف الأول بتقديم:
• تقرير فني بعد كل زيارة صيانة
• تقرير ربع سنوي شامل عن حالة الأنظمة
• تقرير سنوي مع توصيات التحديث والتطوير
• توثيق جميع الأعطال والإصلاحات
• سجل لجميع قطع الغيار المستخدمة`,
        },
        {
          title: "التوقيعات",
          content: `تم التوقيع على هذا العقد بتاريخ {{signDate}}

عن الطرف الأول:                    عن الطرف الثاني:
الاسم: ___________________         الاسم: ___________________
التوقيع: __________________        التوقيع: __________________
الختم: ___________________         الختم: ___________________`,
        },
      ],
      he: [
        {
          title: "מבוא לחוזה",
          content: `חוזה תחזוקה מקיפה מספר: {{contractNumber}}

בין חברת {{companyName}} (צד א' / נותן השירות)
ו{{customerName}} - {{customerCompany}} (צד ב' / הלקוח)

אתר: {{projectName}}
תאריך חתימה: {{signDate}}`,
        },
        {
          title: "היקף השירותים המקיפים",
          content: `חוזה זה כולל את כל שירותי התחזוקה המונעת והמתקנת:

א. תחזוקה מונעת (תקופתית):
• {{visitsPerYear}} ביקורי תחזוקה מתוכננים בשנה
• בדיקה מקיפה של כל הרכיבים
• ניקוי ובדיקת מכשירים
• עדכון תוכנה ומערכות
• כיול מצלמות וחיישנים

ב. תחזוקה מתקנת (תיקונים):
• תיקון תקלות ללא עלות נוספת (למעט חלקי חילוף)
• החלפת רכיבים פגומים
• תכנות מחדש של מערכות לפי הצורך

ג. תמיכה טכנית:
• תמיכה טלפונית 24/7
• תמיכה מרחוק דרך האינטרנט
• תגובה לחירום תוך שעתיים`,
        },
        {
          title: "תקופה וחידוש",
          content: `תקופת החוזה: מ-{{startDate}} עד {{endDate}}
חידוש: אוטומטי לתקופה זהה
ביטול: בהודעה בכתב 60 יום לפני הסיום`,
        },
        {
          title: "ערך ותנאי תשלום",
          content: `ערך שנתי: {{annualPrice}} ש"ח (+ מע"מ 17%)
אופן תשלום: {{paymentTerms}}

המחיר כולל:
✓ כל הביקורים התקופתיים
✓ תיקוני חירום (עבודה בלבד)
✓ תמיכה טכנית מרחוק
✓ דוחות תקופתיים

אינו כולל:
✗ חלקי חילוף וציוד חלופי
✗ עבודות הרחבה והתקנות חדשות
✗ נזקי אסונות טבע`,
        },
        {
          title: "רמת שירות (SLA)",
          content: `| עדיפות | זמן תגובה | זמן פתרון |
|--------|-----------|-----------|
| קריטית  | שעתיים    | 8 שעות    |
| גבוהה  | 4 שעות    | 24 שעות   |
| בינונית | 8 שעות    | 48 שעות   |
| נמוכה  | יום עבודה  | 5 ימים    |

• זמן פעילות מובטח: 99%
• פיצוי באי עמידה: הנחה של 5% מהתשלום החודשי לכל יום עיכוב`,
        },
        {
          title: "דוחות ותיעוד",
          content: `צד א' מתחייב לספק:
• דוח טכני לאחר כל ביקור תחזוקה
• דוח רבעוני מקיף על מצב המערכות
• דוח שנתי עם המלצות לעדכון ופיתוח
• תיעוד כל התקלות והתיקונים
• רישום כל חלקי החילוף שנעשה בהם שימוש`,
        },
        {
          title: "חתימות",
          content: `חוזה זה נחתם בתאריך {{signDate}}

עבור צד א':                        עבור צד ב':
שם: ___________________             שם: ___________________
חתימה: __________________          חתימה: __________________
חותמת: ___________________         חותמת: ___________________`,
        },
      ],
      en: [
        {
          title: "Contract Introduction",
          content: `Comprehensive Maintenance Contract No.: {{contractNumber}}

Between {{companyName}} (First Party / Service Provider)
and {{customerName}} - {{customerCompany}} (Second Party / Client)

Site: {{projectName}}
Signing Date: {{signDate}}`,
        },
        {
          title: "Comprehensive Service Scope",
          content: `This contract covers all preventive and corrective maintenance services:

A. Preventive Maintenance (Periodic):
• {{visitsPerYear}} scheduled maintenance visits per year
• Comprehensive inspection of all components
• Cleaning and testing devices
• Software and system updates
• Camera and sensor calibration

B. Corrective Maintenance (Repairs):
• Fault repair at no additional cost (excluding spare parts)
• Replacement of damaged components
• System reprogramming as needed

C. Technical Support:
• 24/7 phone support
• Remote support via internet
• Emergency response within 2 hours`,
        },
        {
          title: "Duration and Renewal",
          content: `Contract Period: From {{startDate}} to {{endDate}}
Renewal: Automatic for an equivalent period
Cancellation: Written notice 60 days before expiration`,
        },
        {
          title: "Value and Payment Terms",
          content: `Annual Value: {{annualPrice}} ILS (+ 17% VAT)
Payment Method: {{paymentTerms}}

Price Includes:
✓ All periodic visits
✓ Emergency repairs (labor only)
✓ Remote technical support
✓ Periodic reports

Does Not Include:
✗ Spare parts and replacement equipment
✗ Expansion and new installations
✗ Natural disaster damages`,
        },
        {
          title: "Service Level Agreement (SLA)",
          content: `| Priority | Response Time | Resolution Time |
|----------|--------------|-----------------|
| Critical | 2 hours      | 8 hours         |
| High     | 4 hours      | 24 hours        |
| Medium   | 8 hours      | 48 hours        |
| Low      | 1 business day | 5 days         |

• Guaranteed uptime: 99%
• Non-compliance penalty: 5% discount from monthly payment per day of delay`,
        },
        {
          title: "Reports and Documentation",
          content: `The First Party commits to providing:
• Technical report after each maintenance visit
• Quarterly comprehensive report on system status
• Annual report with upgrade and development recommendations
• Documentation of all faults and repairs
• Record of all spare parts used`,
        },
        {
          title: "Signatures",
          content: `This contract is signed on {{signDate}}

For the First Party:                For the Second Party:
Name: ___________________           Name: ___________________
Signature: __________________       Signature: __________________
Stamp: ___________________          Stamp: ___________________`,
        },
      ],
    },
  },
  {
    id: "maintenance-basic",
    name: {
      ar: "عقد صيانة أساسية",
      he: "חוזה תחזוקה בסיסי",
      en: "Basic Maintenance Contract",
    },
    sections: {
      ar: [
        { title: "الأطراف", content: `مزود الخدمة: {{companyName}}\nالعميل: {{customerName}} - {{customerCompany}}\nالموقع: {{projectName}}` },
        { title: "الخدمات", content: `يتعهد مزود الخدمة بتنفيذ {{visitsPerYear}} زيارات صيانة وقائية سنوياً تشمل:\n• فحص عام للأنظمة\n• تنظيف الأجهزة\n• فحص التوصيلات\n• تقرير فني مختصر\n\nملاحظة: الإصلاحات والطوارئ تُحتسب بشكل منفصل.` },
        { title: "المدة والقيمة", content: `الفترة: {{startDate}} - {{endDate}}\nالقيمة: {{annualPrice}} شيكل سنوياً (+ ض.ق.م)\nالدفع: {{paymentTerms}}` },
        { title: "شروط عامة", content: `• الإلغاء بإشعار 30 يوماً\n• لا يشمل قطع الغيار\n• الاستجابة للطوارئ خلال يوم عمل\n• يتجدد تلقائياً\n\nالتوقيع: ___________________     التاريخ: {{signDate}}` },
      ],
      he: [
        { title: "הצדדים", content: `נותן השירות: {{companyName}}\nהלקוח: {{customerName}} - {{customerCompany}}\nאתר: {{projectName}}` },
        { title: "שירותים", content: `נותן השירות מתחייב לבצע {{visitsPerYear}} ביקורי תחזוקה מונעת בשנה הכוללים:\n• בדיקה כללית של המערכות\n• ניקוי מכשירים\n• בדיקת חיבורים\n• דוח טכני קצר\n\nהערה: תיקונים וחירום יחושבו בנפרד.` },
        { title: "תקופה וערך", content: `תקופה: {{startDate}} - {{endDate}}\nערך: {{annualPrice}} ש"ח בשנה (+ מע"מ)\nתשלום: {{paymentTerms}}` },
        { title: "תנאים כלליים", content: `• ביטול בהודעה של 30 יום\n• אינו כולל חלקי חילוף\n• תגובה לחירום תוך יום עבודה\n• חידוש אוטומטי\n\nחתימה: ___________________     תאריך: {{signDate}}` },
      ],
      en: [
        { title: "Parties", content: `Service Provider: {{companyName}}\nClient: {{customerName}} - {{customerCompany}}\nSite: {{projectName}}` },
        { title: "Services", content: `The service provider commits to performing {{visitsPerYear}} preventive maintenance visits per year including:\n• General system inspection\n• Device cleaning\n• Connection inspection\n• Brief technical report\n\nNote: Repairs and emergencies are charged separately.` },
        { title: "Duration and Value", content: `Period: {{startDate}} - {{endDate}}\nValue: {{annualPrice}} ILS annually (+ VAT)\nPayment: {{paymentTerms}}` },
        { title: "General Terms", content: `• Cancellation with 30 days notice\n• Does not include spare parts\n• Emergency response within 1 business day\n• Auto-renewal\n\nSignature: ___________________     Date: {{signDate}}` },
      ],
    },
  },
];

export function fillTemplate(
  template: ContractTemplate,
  vars: Record<string, string>,
  locale: string
): { name: string; sections: ContractSection[] } {
  const sections = getTemplateSections(template, locale);
  return {
    name: getTemplateName(template, locale),
    sections: sections.map((s) => ({
      title: s.title,
      content: s.content.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || `{{${key}}}`),
    })),
  };
}
