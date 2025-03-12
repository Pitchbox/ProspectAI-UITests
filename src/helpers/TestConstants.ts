export const logInData = {
    username: "prospectaiautotests@gmail.com",
    password: "Test!2025",
    url: "//app.prospectailabs.com/sign-in**",
};

export const emailCleaningListTestData = {
    username: "test.prospectai@gmail.com",
    password: "Test!2025",
    emailCleaningLists: ["1QTestListForSelectedEmails", "qa", "1QTestListForDownload", "ForArchive"],
    uploadedEmailCleaningList: "Test1List 2",
    newListName: 'Test1List New',
    archivedTestList: 'ForArchive',
    expectedEmailsListSortedByAscending: [
        "321.qwerty@sciplay.com",
        "claims@rspca-petinsurance.com",
        "dl-affiliates@justanswer.com",
        "gavin@acuityscheduling.com",
        "james.yeates@rspca.org.uk",
        "kmcmahon@businessinsider.com",
        "reggie@zergnet.com",
        "zak@duck.com",
        "zoodonate_bg@zooplus.com"
    ],
    expectedEmailsListSortedByDescending: [
        'zoodonate_bg@zooplus.com',
        'zak@duck.com',
        'reggie@zergnet.com',
        'kmcmahon@businessinsider.com',
        'james.yeates@rspca.org.uk',
        'gavin@acuityscheduling.com',
        'dl-affiliates@justanswer.com',
        'claims@rspca-petinsurance.com',
        '321.qwerty@sciplay.com'
    ],
    testListForDownload: '1QTestListForDownload',
    testListForSelectedEmails: 'TestListForSelectedEmails',
    expectedListValidEmails: [
        'claims@rspca-petinsurance.com',
        'dl-affiliates@justanswer.com'
    ],
    expectedListCatchAllEmails: [
        'gavin@acuityscheduling.com',
        'reggie@zergnet.com',
        '321.qwerty@sciplay.com',
        'kmcmahon@businessinsider.com',
        'zoodonate_bg@zooplus.com'
    ],
    expectedListInvalidEmails: [
        'james.yeates@rspca.org.uk',
    ],
    expectListUnknownEmails: [
        'zak@duck.com'
    ],
    validListName: 'ValidList',
    invalidListName: 'InvList',
    catchAllListName: 'CatchAllList',
    unknownListName: 'UnknownList',
    listNames: ['InvList', 'ValidList', 'CatchAllList', 'UnknownList']
};

export const testDataListsPage = {
    username: 'prospectaiautotests+4@gmail.com',
    password: 'Test!2025',
    lists: ['Address book', 'Default', 'Test 0', 'Test 1', 'Test 2', 'Test 3'],
    defaultLists: ['Address book', 'Default'],
    webHookName: 'Test WebHook',
    webHookUrl: 'https://wh7e4fee753c93a9ad63.free.beeceptor.com',
    exportedList: ['jessica.roberts@piedmont.org'],
}

export const contactsTestData = {
    username: 'prospecttest716@gmail.com',
    password: 'Test!2025',
    preSetUpContacts: ['vetdiet@chewy.com', 'zoo@plus.com', 'rhea@longmonthumane.org'],
    domains: [
        'JWafPJEfqKqcvbZNBRnRBYbViZVckQGoPLBTsAaZEFHXGcYdguXAfoxMVdLsm.JWafPJEfqKqcvbZNBRnRBYbViZVckQGoPLBTsAaZEFHXGcYdguXAfoxMVdLszYt.JWafPJEfqKqcvbZNBRnRBYbViZVckQGoPLBTsAaZEFHXGcYdguXAfoxMVdLszYt.JWafPJEfqKqcvbZNBRnRBYbViZVckQGoPLBTsAaZEFHXGcYdguXAfoxMVdLsyy',
        't.io',
        'www.halian.com'
    ],
    companyNames: [
        'AfPJEfqKqcvbZNBRnRBYbViZVckQGoPLBTsAaZEFHXGcYdguXAfoxMVdLsm.JWafPJEfqKqcvbZNBRnRBYbViZVckQGoPLBTsAaZEFHXGcYdguXAfoxMVdLszYt.JWafPJEfqKqcvbZNBRnRBYbViZVckQGoPLBTsAaZEFHXGcYdguXAfoxMVdLszYt.JWafPJEfqKqcvbZNBRnRBYbViZVckQGoPLBTsAaZEFHXGcYdguXAfoxMVdLsyy',
        'T1',
        'Halian.com'
    ],
    //500 simbols
    longDiscription: 'Long DiscriptionLong Discription Long Discription Long Discription Long DiscriptionLong Discription Long Discription Long Discription Long DiscriptionLong Discription Long Discription Long Discription Long DiscriptionLong Discription Long Discription Long Discription Long DiscriptionLong Discription Long Discription Long Discription Long DiscriptionLong Discription Long Discription Long Discription Long DiscriptionLong Discription Long Discription Long Discription Long DiscriptionLong Discription Lo Discription',
    invalidDomains: [
        'lgWafPJEfqKqcvbZNBRnRBYbViZVckQGoPLBTsAaZEFHXGcYdguXAfoxMVdLsm.JWafPJEfqKqcvbZNBRnRBYbViZVckQGoPLBTsAaZEFHXGcYdguXAfoxMVdLszYt.JWafPJEfqKqcvbZNBRnRBYbViZVckQGoPLBTsAaZEFHXGcYdguXAfoxMVdLszYt.JWafPJEfqKqcvbZNBRnRBYbViZVckQGoPLBTsAaZEFHXGcYdguXAfoxMVdLsyyg',
        'talian',
        '-example-tech.com-',
        '.exam !ple@.com.',
        'i.y'
    ],
    invalidCompanyNames: [
        'L fPJEfqKqcvbZNBRnRBYbViZVckQGoPLBTsAaZEFHXGcYdguXAfoxMVdLsm.JWafPJEfqKqcvbZNBRnRBYbViZVckQGoPLBTsAaZEFHXGcYdguXAfoxMVdLszYt.JWafPJEfqKqcvbZNBRnRBYbViZVckQGoPLBTsAaZEFHXGcYdguXAfoxMVdLszYt.JWafPJEfqKqcvbZNBRnRBYbViZVckQGoPLBTsAaZEFHXGcYdguXAfoxMVdLsyy',
        'T',
        '-!@#$%^ Halian.com',
        '  ,  ',
        '№1'
    ],
    errorMessagesUnderCompanyName: [
        'Organization name is too long',
        'Organization name is too short',
        'Invalid organization name',
        'Organization name is too short',
        'Invalid organization name'
    ],

    contactsTestEmails: [
        'zoodonate_bg@zooplus.com',
        'zak@duck.com',
        'reggie@zergnet.com',
        'kmcmahon@businessinsider.com',
        'james.yeates@rspca.org.uk',
        'gavin@acuityscheduling.com',
        'dl-affiliates@justanswer.com',
        'claims@rspca-petinsurance.com',
        '321.qwerty@sciplay.com',
        'kirstine@qa-financial.com',
        'alan.ross@h2scan.com'
    ]
}

export const outreachTestData = {
    GoogleAccount: '',
    GooglePassword: '',
    MicrosoftOutlookAccount: 'testingprospect@outlook.com',
    ImapSmtpAccount: 'ethan.caldwell@jadevertex.com',
    ImapSmtpPassword: '7R!dL5@cW8q%Mj',
    ImapSmtpServer: 'mail.tutoremail.com ',

    ImapSmtpAccount1: 'lizzie@tutoremail.com',
    ImapSmtpPassword1: '@Am;YIzs{r~c',
}

export const profileTestData = {
    email: 'prospectaiautotests@gmail.com',
    firstName: 'Test',
    lastName: 'ProspectAi',
    companyName: 'Test',
    country: 'United States',
    timeZone: 'Pacific Time (US & Canada)'
}

export const integrationTestData = {
    urlPitchbox: '//welcome.pitchboxlabs.com/**',
    urlPipedrive: '//oauth.pipedrive.com/auth/login?**',
    urlHubspot: '//app.hubspot.com/oauth/authorize?**',
    urlSalesforce: '//login.salesforce.com/setup/**',
    urlZoho: '//accounts.zoho.com/signin?**',
    urlMonday: '//auth.monday.com/auth/**',
    consumerKey: '43c074d0-f86c-4101-9b72-9c70a3d76db3',
    consumerSecret: 'A6c07Ph51Zop0AglV_kCmCxRt9jC40FGmRpvuRdSfB644nD5Sd9WLcjwR1x3rV8S'
}

export const shareWithFriendsTestData = {
    invalidEmails: [
        'test@',
        'exam@t.o',
        'exam@wspCPnLfMEMYTpUtTDBXctnTRYVVjcjtvufLwePFmKdEpuYPnxkdCcuiVPHByj.spCHaPnLfMEMYTpUtTDBXctnTRYVVjcjtvufLwePFmKdEpuYPnxkdCcuiVPHBj.YYRtsGpWMoJzdfidjquAVygnjKhiYcHFDYaPDXhKwTrZJoTrbCcbdFFT.spCHaPnLfMEMYTpUtTDBXctnTRYVVjcjtvufLwePFmKdEpuYPnxkdCcuiVPHByj.com',
        'exam@io.dAvjkWvTsFLfzPnmHxZbkFJqvgHbZnUqnNGfCHsCzerTyPcYsMRWfAxtHwUZioCm',
        '@t.io',
        'use r-{}>+@gmail.com',
        'bbuysefPLMRWUCBHXvhhgknKGcAWZPpaMfBuiTJZytgbWuKtkcCgTenCybqGytpoTs@t.io',
        '.exam@w3schools.com',
        'exam_t.io'
    ]
}

export const yearTeamTestData = {
    testTeamMembers: [
        "prospectaiautotests@gmail.com",
        "prospectaiautotests+1@gmail.com",
        "prospectaiautotests+2@gmail.com"],
    apiKeyMailSlurp: '4f8f80fca0eae7f4b56fae88ee483850b173cec2 77fb0453cf2c702c62ef1f9d',
    inboxId: '6f111f52-104a-4c93-88a9-d83bf457e11f',
    inboxEmail: "6f111f52-104a-4c93-88a9-d83bf457e11f@mailslurp.biz",
    newTeamMember: 'prospectaiautotests+5@gmail.com',
    validPasswords: [
        'Pass! 12',
        'P@ssword123世界',
        '!{}1p@@$^:{}<>oHcVXfwMVugoQLTqjPRJpzVZHNtrkortfcssLCpURfEDWqwUpU'
    ],
    invalidPasswords: [
        '12345678',
        'q',
        '!{}1p@@$^:{}<>oHcVXfwMVugoQLTqjPRJpzVZHNtrkortfcssLCpURfEDWqwUpU%',
        //'N Pass1 ',//now valid 
        'password',
        'Pass!12',
        'pass!123'
    ],
    confirmationLinkTest: 'https://app.prospectailabs.com/team/members/invitation/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDI3LCJnZW5lcmF0ZUF0IjoiMjAyNS0wMi0yNlQxMjowMzoxMS44NDRaIiwiZXhwaXJlQXQiOiIyMDI1LTAyLTI2VDEzOjAzOjExLjg0NFoiLCJpYXQiOjE3NDA1NzEzOTEsImV4cCI6MTc0MDU3NDk5MX0.xOS4fqM4yJmNv5Vn29zPfBhii-B-WYDGH912vQwEylU'
}

export const resetPasswordTestData = {
    email: 'prospectaiautotests+3@gmail.com',
    password: 'Test!2025',
    validPasswords: [
        'Pass! 12',
        'P@ssword123世界',
        '!{}1p@@$^:{}<>oHcVXfwMVugoQLTqjPRJpzVZHNtrkortfcssLCpURfEDWqwUpU',
        'Test!2025'
    ],
    invalidPasswords: [
        '12345678',
        'q',
        '!{}1p@@$^:{}<>oHcVXfwMVugoQLTqjPRJpzVZHNtrkortfcssLCpURfEDWqwUpU%',
        'N Pass1 ',
        'password',
        'Pass!12',
        'pass!123'
    ]
}

export const testDataSubscriptionPlans = {
    payMonthlySubscriptionPlans: ['Free', 'Basic - Monthly', 'Basic - Yearly', 'Advanced - Monthly', 'Pro - Daily'],
    payMonthlySubscriptionPlansWithPrices: [
        'FreeForever free plan$0.00/daySelect',
        'Basic plan charged monthly$10.00/mo',
        'Basic plan charged annualy$7.00/mo$85.00/yearSelect',
        'Advanced plan charged monthly$20.00/mo',
        'Dollar A Day$1.00/day'],
    buyCreditsSubscriptionPlans: ['Pay as you Go - 2K', 'Pay as you Go - 5'],
    buyCreditsSubscriptionPlansPrices: [
        'Pay as you Go - 2K credits$50.00',
        'Pay as you Go - 5 credits$1.00']
}
