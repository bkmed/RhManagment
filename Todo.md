see all absence same team or same entreprise employee

user can rearange menu edit

manage review period

Add missing profile.documents translation key to all language files
Remove "Mon équipe" (My Team) from main menu navigation
Add team section to Profile screen when user has a company
Display "not assigned to company" message when clicking team without company
Navigation & Company Settings
Fix department/service navigation back button to return to company settings
Rename "param entreprise" to more professional name in all languages
Update English translation
Update French translation
Update Arabic translation
Update German translation
Update Spanish translation
Update Hindi translation
Update Chinese translation
Employee & Team Assignment Constraints
Enforce one team per employee constraint in data model
Enforce one company per employee constraint in data model
Update AddTeamScreen dropdown to exclude employees with teams in selected company
Update AddCompanyScreen to exclude employees already assigned to companies
Enforce one company per team constraint
Update team assignment dropdowns to exclude teams already assigned to companies
Filter employees from dropdowns when already assigned to company
Filter employees from dropdowns when already assigned to team in company

lors de la selection des employer dans une equipe afficher le nombre demployer selectioner et mettre en rouge le nombre si il depasse le 10 la restriction et 0 aussi

missing roles.undefined
invoice fix theme le contenu au dessous de no invoice est blanc diferent de celui de no invoice
la recherche global affiche la liste des entreprise alors que lemployer na pa acce a sa il faut rajouter dans la recherche global les acce au page par role
rajoute moi un md avec tt les page et les leur roles et use case des 4 role dans une autre md

page analytic doit etre dedier que a lemployer pour voir ses statistique pas besoin de la section hr insights Upcoming Leaves (Employees)
une aurer page analytique selon son role si rh voir tt les equipe danas la meme entreprise que lui si chef equipe que son equipe et admin voir tt les equipe et entreprise

dans add ilness :

- Payroll Item Name \* par objet
- employee name se rempli direct par le user connecter sinn si cest un rh ou admin rune autre page pour rajouter un employer (par employer drop down avec entreprise equipe comme filtre )
- remove fieald local
  -update name Weekly date de la maladie ou autre plus pro
  -replace Expiry Date (Optional) par end date et aficher a coter selon le choi des 2 fiel le nombre de jour prix dans le add ilness
  -enlever employee planing pour employee le laisser pour rh chef dequipe ou admin pour voir les employer qui gerer seulement admin (all) rh (all employer son entreprise) ( chef dequipe only his team) employe que son mayplanning

facture invoice que rh ou admin peuvent la voir et rajouter dedans et filtrer par entreprise

dans addclaim si il choisi material sa liste de material drop down se rajouter

common.submit missing

ajouter un employer que rh et admin peuvent le faire

approbations en atente admin (all) rh (all employer son entreprise) ( chef dequipe only his team) employe que les sien et biensure rh et admin et chef equipe peuveut voir leur mais peuvent pas accepter et refuser leur demande de congé

addleave:
leaves.status missing et par defaut pending cest pa lemployer qui choisi le status
replacer Titre \* par objet
remplace Lieu de travail par cause
rajouter un rappele web et mobile lore de sa creation
handle save marche pas et naffiche pas un message de reussite ou error

home screen marche pa bien quand deployer sur github https://bkmed.github.io/Home

rajouter analytics page dans la section general je parle de menu

quand le user est deconnecter et parfois on peu acceder a une page profile il faut le deconecté si il charge une page alors quil est deconecter rajouter un local service pour gestion de user connecter ou pas et device par il se connecter ou il est connecter avec au meme teamps

missing navigation.personalInfo
pk nom , prenom et name de famille met remplace name par alias et calcul age ts seul et remplace age par date de naissance

remplace Lieu de travail par job title et email doit etre unique et required in add employee

Ajouter une maladie lenlever de menu car elle existe dans congé

addinvoice doit rajouter drop down entreprise

addpayroll
heude travailler valider number qui depasse pas 168 si cest conter comme heure supp du coup il faut rajouter le coup dune heur supp et le rajouter au total

Ticket restaurant
et
Tickets Cadeaux il faut que se soit 2 field le nombre de ticket et leur cout valider number pour ses fields
Lieu de travail a enlever et service aussi et le nom (admin all employee , rh all emplyee same entreprise que rh, chef equipe et employee cant add payroll)

Sélectionner l'entreprise
Sélectionner l'équipe les afficher que pour admin pour filter employee in addpayroll

common.invalidAmount missing
rajouter un message de reausite ou error

review all key in all lang to be same and verify the translation if it is ok in all lang

menu nest pas responsive en hauteur et width aussi in resize

employees.birthDate missing
employees.countryplaceholder missing

rajouter manage notification ou on peu envoyer une notification a tt les employe dans la meme equipe ou meme entreprise ou all for admin comme la notif explore the new phase

remplace title: 'Welcome to RhManagment!',
message: 'Explore the new Phase 3 features like Search and Chat.',
avec un welcome pro in all lang
