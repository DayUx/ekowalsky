*** Settings ***
Library    SeleniumLibrary

*** Variables ***
${Site URL}    https://www.example.com
${Browser}     Firefox
${SEARCH}

*** Test Cases ***
Effectuer une recherche sur le site Web
    [Documentation]    Effectue une recherche sur le site Web en utilisant un terme de recherche donné.
    [tags]             recherche
    Effectuer Recherche    ${SEARCH}

*** Keywords ***
Effectuer Recherche
    [Arguments]    ${search_term}
    Open Browser       ${Site URL}    ${Browser}
    Maximize Browser Window
    #Input Text         id=search_box    ${search_term}
    Click Link       xpath=/html/body/div/p[2]/a
    Page Should Contain  ${search_term}
    Close Browser

Page Should Contain
    [Arguments]    ${expected_text}
    Wait Until Page Contains    ${expected_text}    10s