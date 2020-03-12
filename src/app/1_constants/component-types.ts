//------------------------------------------------------------------------
type SectionMainModules = 
  'HOME' | 'COMMON' | 'MENU' | 
  'USER_PROFILE' | 'TRIPS' | 'RIDERS' | 'TASKS';

type SectionSubModules = 'RIDES' | 'TASKS_MEMBERS';

/** Describes the location of the route displaying the element. 
 * Element 'Page' calls the dispatch element of each module to display sub-elements.*/
export type SectionModule = SectionMainModules | SectionSubModules;

//------------------------------------------------------------------------

/** Elements located in the Module 'Menu'.
 * These elements need no specific information or only that of the logged
 * user ( publicName, email) - see user-data.service).*/
type MenuSectionClass = 
  'HEADER' |            // header of the page - may be dynamic
  'MENU' |              // navigation link, with icon, title and desc
  'MESSAGE' |           // simple message, with or without a time lapse/trigger
  'CONFIRM' |           // card asking to confirm action
  'PASSWORD_CONFIRM' |  // card prompting password to confirm action
  'CHANGE_EMAIL' |      // card to change email: also prompts password
  'NAVIGATE' |          // same as 'menu', but as card format
  'EMAIL_PASSWORD' |    // card prompting email and password
  'SIGN_UP' |           // card to create a new account
  'CHANGE_PASSWORD' |   // card to change password, prompts current passward
  'CHOICE_LIST' |       // collection of button cards
  'DIVIDER' |           // title + sub-title + horizontal bar 
  'INLINE_LINK' |       // navigation link: simple text
  'CHANGE_ALIAS' |
  'USER_CARD'; 

type TravelerSectionClass = 
  'USER_TRAVELERS' |    // list the travelers in the user profile
  'SELECT_TRAVELERS';   // traveler list + confirm + message

type NoticeSectionClass = 
  'TASK_NOTICES';  // list of notices

type UserProfileSectionClass = 
  'PROFILE_INFOS' |   // list of addresses, phones or emails
  'TRAVELER' |        // a single traveler profile card
  'ADDRESS' |         // a single address card (edit/create)
  'PHONE'   |         // a single phone card (edit/create)
  'EMAIL'   |         // a single email card (edit/create)
  'OWN_TRAVELER' |    // either a traveler
  'EMPTY';            // non-displayed component: 
                      // use to trigger the ngOnInit action of the dispatch component 

type TripSectionClass =
  'USER_TRIPS' |        // list trips, results depend on search criteria
  'TRIP_FORM' |         // form to update a particular trip
  'TRIP_ALIAS' |        // change the alias of a user-trip
  'TRIP';               // details of a trip (card)

type RiderSectionClass =
  'USER_RIDERS' |     // list riders, results depend on context or search criteria
  'RIDER_MEMBERS' |   // change the members (travelers or passengers) of a rider
  'RIDER_LOC' |       // change the local origin/destination of a rider (address)
  'RIDER_VALIDATE' |  // last step of the rider's creation
  'RIDER_INITIATE' |  // second step of rider's (not linked to via) creation
  'RIDER';            // simple rider cards

type RideSectionClass = 
  'RIDES_LIST' |          // list rides, results depend on context or search criteria
  'RIDE' |                // single ride card
  'RIDE_MEMBERS' |        // list of members linked to a ride
  'RIDE_MEMBER_FORM' |    // form for a single ride member
  'RIDE_MEMBER_CARD' |    // single member associated to a ride
  'RIDE_MANAGE_FORM';     // manage the ride members 


type TasksSectionClass = 
  'USER_TASKS' |          // list tasks
  'TASK_HELPEES' |        // change the beneficiaries/members of a task
  'TASK_LOC'  |           // change the local origin/destination of a task (address)
  'TASK_VALIDATE' |       // last step of task creation
  'TASK_INITIATE' |       // first step of a provisional task
  'TASK';                 // simple task cards

type TasksMembersSectionClass =
  'TASK_MEMBERS' |        // list of members (and sometimes volunteers) linked to a task
  'MEMBER_FORM' |         // form for a single task member
  'VOLUNTEER_FORM' |      // form for a single passenger
  'TASK_MEMBER' |         // single member associated to a task
  'TASK_VOLUNTEER' |      // single passenger not yet associated to a task
  'MEMBERS_MANAGE_FORM';  // manage the members

  
/** Describes the component to be used by the html template.
 * If the SectionModule is not 'common', the element 'Page' delegates the selection of
 * the element to the 'Dispatch' element of this module.*/
export type SectionClass = 
    MenuSectionClass |    
    TravelerSectionClass |
    NoticeSectionClass |
    UserProfileSectionClass | 
    TripSectionClass |
    RiderSectionClass |
    RideSectionClass |
    TasksSectionClass |
    TasksMembersSectionClass;


//------------------------------------------------------------------------
/** Types of menu items that are not card or header: navigation */
type MenuSectionType = 
  'LINK' |                  // option of 'menu': simple link to somewhere else.
  'LINK_SPACED' |           // option of 'inline_link'
  'INFO' |                  // option of 'message': just display text and an image
  'TRANSITION' |            // option of 'message': wait to trigger redirect
  'SECTION_DIVIDER' |       // option of 'divider'
  'ICON_ACCOUNT' |          // option of 'menu'
  'ICON_TRAVELER' |
  'ICON_TRAVELER_PIN' |     
  'ICON_TASK' |
  'ICON_PLANE' |
  'ICON_TAKEOFF' |
  'ICON_LAND' |
  'ICON_ADDRESS' |
  'ICON_PHONE' |
  'ICON_EMAIL' |
  'ICON_GEAR' |
  'ICON_LOGOUT' |
  'ICON_BIN' |
  'ICON_TAXI' |
  'ICON_CAR' |
  'ICON_BED' |
  'ICON_HOUSE' |
  'ICON_LABEL' |
  'ICON_LUGGAGE' |
  'ICON_JOIN' |
  'ICON_SEAT' |
  'ICON_ADD' |
  'ICON_REMOVE' |
  'ICON_MESSAGE' |
  'ICON_LOCK';


/** Types of Header - text is static, all others are dynamic*/
type HeaderType = 
  'TEXT' |                  // simple text, non-dynamic
  'USER' |                  // change header based on the info of the logged user (see UserDataService)
  'TRAVELER' |              // change header based on a specific traveler
  'CROSS_REDIRECT' |        // navigate back between sections using custom links / paramMap (see riders)
  'NO_SPACING';             // option of divider

/** Types of Card. Various impact depending on the SectionClass:
 * + confirm: determines the action after the use presses 'Confirm'*/
 type CardType = 
  'CARD' |                      // no specific effect: just make it clear the component is a card
  'SIGN_OUT' |                  // option of 'confirm' SectionClass
  'SIGN_IN' |                   // option of 'email_password'    
  'DELETE_ACCOUNT' |            // option of 'password_confirm'
  'UNLINK_TRAVELER' |           // option of 'password_confirm'
  'LINK_TRAVELER' |             // option of 'sign_in'
  'EDIT' |                      // option of {traveler}
  'CREATE' |                    // option of {traveler}
  'EDIT_FORUSER' |              // option of {address, phone, email}
  'CREATE_FORUSER' |            // option of {address, phone, email}
  'EDIT_FORTRAVELER' |          // option of {address, phone, email}
  'CREATE_FORTRAVELER' |        // option of {address, phone, email}
  'DELETE_USER_ADDRESS' |       // option of {confirm}
  'DELETE_TRAVELER_ADDRESS' |   // option of {confirm}
  'DELETE_USER_PHONE' |         // option of {confirm}
  'DELETE_TRAVELER_PHONE' |     // option of {confirm}
  'DELETE_USER_EMAIL' |         // option of {confirm}
  'DELETE_TRAVELER_EMAIL' |     // option of {confirm}
  'IF_NO_TRAVELER' |            // option of 'inline-link' (used in UserProfile)
  'IF_TRAVELER' |               // option of 'inline-link' (used in UserProfile)
  'DISPATCH_NEW_TRIP' |         // option of 'navigate' (used in Trips)
  'CONFIRM_NEWTRIP_PAX' |       // option of 'navigate' or 'message'
  'CONFIRM_NEWVIA_PAX' |        // option of 'navigate' 
  'CONFIRM_REFTRIP_PAX' |       // option of 'navigate'
  'CONFIRM_REFVIA_PAX' |        // option of 'navigate'
  'LINK_TRIP_NEWRIDERS' |       // option of 'navigate'
  'LINK_TRIP_NEWTASKS' |        // option of 'navigate'
  'CONFIRM_UNREF_RIDERS' |      // option of 'navigate'
  'LINK_TASKERS_MANAGE' |       // option of 'navigate'
  'DELETE_TRIP' |               // option of 'password_confirm'
  'FROMTRIP_LOC' |              // option of 'rider_loc'
  'EXISTING_LOC' |              // option of 'rider_loc'
  'UNREFRIDER_LOC' |            // option of 'rider_loc'
  'DELETE_RIDER' |              // option of 'password_confirm'
  'OWN_RIDE_MEMBER' |           // option of 'ride_member_card'
  'OTHER_RIDE_MEMBER' |         // option of 'ride_member_card'
  'LINK_TRIP_NEWTASKS' |        // option of 'navigate'
  'PROVISIONAL_LOC_DEP' |       // option of 'task_loc'
  'PROVISIONAL_LOC_ARR' |       // option of 'task_loc'
  'FROMTRIP_LOC_DEP' |          // option of 'task_loc'
  'FROMTRIP_LOC_ARR' |          // option of 'task_loc'
  'EXISTING_LOC_DEP' |          // option of 'task_loc'
  'EXISTING_LOC_ARR' |          // option of 'task_loc'
  'DELETE_TASK' |               // option of 'password_confirm'
  'OWN_TASK' |                  // option of 'task_card' (expanded by default)
  'OWN_TASK_SUMMARY' |          // option of 'task_card' (collapsed by default)
  'KNOWN_TASK' |                // option of 'task_card': identified by user-task
  'KNOWN_TASK_SUMMARY' |        // option of 'task_card': identified by user-task
  'OWN_TASKER' |                // option of 'member_card'
  'OTHER_TASKER' |              // option of 'member_card'
  'HELPEE' |                    // option of 'member_card'
  '-CARD';



/** Types of list: container element that displays a list of other elements */
type ListType = 
  'LIST' | 
  'SELF_TRAVELER_ONLY' |          // option of 'user_travelers' sectionClass
  'USER_ADDRESSES' |              // option of 'profile_infos'
  'USER_PHONES' |                 // option of 'profile_infos'
  'USER_EMAILS' |                 // option of 'profile_infos'
  'TRAVELER_ADDRESSES' |          // option of 'profile_infos'
  'TRAVELER_PHONES' |             // option of 'profile_infos'
  'TRAVELER_EMAILS' |             // option of 'profile_infos' 
  'NEW_TRIP_PASSENGERS' |         // option of 'user_travelers'
  'NEW_VIA_PASSENGERS' |          // option of 'user_travelers'
  'REF_TRIP_PASSENGERS' |         // option of 'user_travelers' -- editing trip
  'REF_VIA_PASSENGERS' |          // option of 'user_travelers' -- editing trip via
  'UNREF_RIDER_MEMBERS' |         // option of 'user_travelers'
  'FROMTRIP_NEWRIDERS' |          // option of 'user_riders'
                                  // -- potential riders associated to a trip
  'OWN_RIDERS' |                  // options of 'user_rider'
  'POTENTIAL_RIDERS' |            // options of 'user_rider'
  'FROMTRIP_RIDETYPE' |           // option of 'choice_list'
  'UNREF_RIDETYPE' |              // option of 'choice_list'

  'REVIEW_RIDES' |                // option of 'rides_list'
  'FIND_RIDES' |                  // options of 'rides_list'

  'FROMTRIP_TASKS' |              // option of 'user_tasks'
  'NEW_TASKS' |                   // option of 'user_tasks'
  'OWN_TASKS' |                   // option of 'user_tasks'
  'OTHERS_TASKS' |                // option of 'user_tasks'
  'PROVISIONAL_HELPEES' |         // option of 'user_travelers'
  'EXISTING_BENEFICIARIES' |      // options of 'user_travelers'
  'FROMTRIP_TASKTYPE' |           // option of 'choice_list'
  'PROVISIONAL_TYPE' |            // option of 'choice_list'
  'FIND_MEMBERS' |                // option of 'task_members'
  'REVIEW_MEMBERS' |              // option of 'task_members'
  'MANAGE_MEMBERS' |              // option of 'members_manage_form'
  '-LIST';

 
/** Types of empty: non-displayed element used to trigger a call to the backend*/
type EmptyType = 'FETCH_PROFILE';

type ComplexFormType =
  'CREATE_TRIP' |             // option of 'trip_change' 
  'EDIT_TRIP' |               // option of 'trip_change' 
  'FROMTRIP_RIDER' |          // option of 'rider_validate_form' 
  'EXISTING_RIDER' |          // option of 'rider_validate_form' 
  'UNREF_RIDER' |             // option of 'rider_validate_form',
                              // 'rider_init_form' and 'rider_members_form' 
  'ACT_AS_ADMIN' |            // option of 'ride-member-form'
  'ACT_AS_CORIDER' |          // option of 'ride-member-form'
  'MANAGE_ALL_CORIDERS' |     // option of 'ride-manage-form'
                            
  'FROMTRIP_TASK' |           // option of 'task_validate_form'
  'EXISTING_TASK' |           // option of 'task_validate_form'
  'PROVISIONAL_TASK' |        // option of 'task_validate_form'
                              // 'task_init_form' and 'task_beneficiaries_form'
  'MANAGE_TASKER' |           // option of 'member_form': helpees acting on tasker
  'RESPOND_AS_TASKER' |       // option of 'member_form': tasker responding to helpers
  'MANAGE_ALL_TASKERS' |      // otpion of 'member_manage_form'
  'CONTACT_PASSENGER' |       // option of 'volunteer_form' : helpees contacting a pax
  'CONTACT_HELPEES';          // option of 'volunteer_form': pax contacting helpees


/** Provides additional information about the content, depending on the SectionModule and SectionClass
 * 
 * + Class 'header': 'text', 'user', 'traveler'
 * + Class 'confirm': 'sign_out'
 * + Class 'password_confirm': 'delete_account'
 * + Class 'traveler': 'create' | 'edit' */
export type SectionType = 
  MenuSectionType | HeaderType | CardType | ListType | EmptyType | ComplexFormType;