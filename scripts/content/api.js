/* global SSE */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-unused-vars */
let API_URL = 'https://api.wfh.team';
chrome.storage.local.get(['environment'], (result) => {
  if (result.environment === 'development') {
    API_URL = 'https://dev.wfh.team:8000';
  }
});

// get auth token from sync storage
const defaultHeaders = {
  'content-type': 'application/json',
};
function arkose() {
  return fetch('https://tcr9i.chat.openai.com/fc/gt2/public_key/35536E1E-65B4-4D96-9D97-6ADB7EFF8147', {
    headers: {
      accept: '*/*',
      'accept-language': 'en-US,en;q=0.9,fa;q=0.8',
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'sec-ch-ua': '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
    },
    referrer: 'https://tcr9i.chat.openai.com/v2/1.5.2/enforcement.64b3a4e29686f93d52816249ecbf9857.html',
    referrerPolicy: 'strict-origin-when-cross-origin',
    body: `bda=eyJjdCI6IloyWURjNmZhTnhHUFAxYWJKN0cydUxkVFNITDRzdTRhYkh4dXY2WXB4WmlIMnVNaC9PUi90cDgvVDJlRnRsNVZkTkhTRjlGa3JPT2JYdnBoY1lrOUtzeUFJTk5lU2ZNV250T1hOYkVCOFBzOGMrdHgzUEh5SEtNMktIZ0ZNa05aZXJFbGdkYUV1aUJoWU1UaWFzR0dZb1pLVVkzdnVnUW11TUc3NklsQk9VK2xvbnFsNXFWK3ZJVEwrSjVCZERGd0xpK2oxUTRRZlVHbWFvSkk1eWplaW5NcSt5ZnBlbW5vMUdIYUljSmNzenB0Z0RHSkdiaEt6UHAxR3hpeExPL2xtTFdxZnpIZmcwWlptdU9LMEt2ODUyZ1gxcW5PNjRlM1FHc3Rvb0ZmMXloMitkNmFIZWQvL3kwV24xL0VhYTRnYXdWbmEwRllzV0xOditFR3FTWjI5eHdLazN5d281cmlyeDNHK2k0Rkx4bWY5MzNLNkZvVEtjckFFcWhMNndzSkhkcUlDblIzVGFTYS9ram5IdFczUVl1WjlnK2dlck82WGZQTndHaE5KVFdGdDZkdUNzMDNEUUdQT1ZBMk1pcXpFZ3JDeSs4dkwram9CZG5RcHhFcEw1Q0R0U09HR0ZEQ21nLzVXRGZ4NWN3WGJ6dStmRDZHSkRTUkV5b1dQS2NaaVlMUjkvRmczZ1NYNllLVXV3LzEyWW5BK2JieTVnbWc3a2pOdmVPRkthQnhkR0J3NHU0bWhVY1N5Z1NpZ0I1VEZEV1NwTWxoenk0MFdmaE1zQlBwQStWQVQyQlN3eGh0bXBUUDJncTlBUWtqdnJSMlk0SjlTRVY4ZlpoRHdST3o0OXdXeWN1Vm85Wm1HTUxyWG4rc1pDSStFOTlhZ0FiSytFUU1zNi8zY1JrZzBLRUwwaXkrREp1YmJCN1F5c2EvQkdrOWY5azA4UGg1Wm5xcUprTy9zQ3hBWHRJMm5IYk1jTjJzVFNGUXBBS1dxbDBBMUI4azJIMzV5ZFZjVnEwck8ycyt5QzZCOVFjd0tlYjZVWmlRTU9hZkR5cmQyRG5JN0hlR2J2UU5ualhnVDRyZ1pYWUpIMVpzUGtwWlZRamtlanlEcVNybWw2UjlnSzNsb09ncm9iNTI1NGdqWHBpRkVjcTdsYlc5NHE1WVA4MVBzYnI4UGdXVHlmUHVDNkdCMVFOUERYUVlpc3ZGekRNTlh1cmFhNzRldnFhVGpEb1kwczUxRUNweU4vSlZESDJ3QjFwTVVZTHA5b3ZNUEZwbDNxd0JndG54YmF6YnFpeWlRV1JpVVlMZ1JSZzJzVzlNeS92aUVVMnk5ZnVUanBqU1dTdjhPUlJBQnBmWE11Nys5T3lkc3JHMklHTkFyaDVPTDJoN3ZmS2FqV0tPckp1NmltNFUvQ0lweVdydVN6OGszMDlXdEpMWTA3dnVnV0ZGY0VMVHdvTXRzdUNWZzh5ZGt4VXNzYTdmeEVlUE5zY2o0T2duRE1FQi8rR2dpUE9aY2FCWEp3Y0tUOHJKbGw1ZDVJWDdWckRoRktINzlZL3lXVWdJMllZSGk2OUU3L2VQM3RFMkhWaEZJUUlpclZ0S29KZlFxWlBXeHBCZ3NTY3VneGlWQ04va2NJUDVrVzcxa3pIZFIyZ1p2VTY3b2QyM1VremxqUzZjeWVwOHhZOW5ubERFaEdEcnlBb1Frd2hLa3FBb055R3gxMUVyWEZQeklFT0E1am1EUkMzK0RWdWhDUXE2RDZnUEZFbHAxUWMyN01tZUIxd21RaUhoM2F1U24wV0VZVmt5aUU1ZmZzbDlFTDVnRFdvZDgwSmhSU3dhRllwdmZPbnVseC9MQ2xHNGJySTVyTnFRTWh1YVprZEZFbEFEL3NVbkJZNEZjazVERTgwL3N3Z2pvUlh0U1YyT0dCWkJxNksvekgxRnNMR3Vld2FaQnh2RExNZDk0NkFDTEhNZTVYd1lWcytPNEk2ZSswVjkvTWZMOTI0cnBmMnA1emt3TEwzNFovSUd5ZVBxUndIdVBTdkVGV3pHNVdld0pWM0x2SEFya3ByeUF0T0UrU1VQQzVRaHFWT2thWDZvMG5JZzkxRTM5ZGNmVEw1eGNBQm1EVVdXV1NMZzlIems2ZDc1eDBKelJmYXAwbitWVDJLUzdxaVRxQVUvVVJialRTelNyQ3BGK0w4NjBzWkFSb0h2bXpXRjhyRkZ0R3RZTjhXYXlYWHgrdlF0MTBxVmcwQWtTTEwrRUZqUkNpMGhuN1ZCa3h0K1FrcVEzQTNEcDdiODJYRVUyTzRWK2tTMGhwRDlaUUxDakdyWmVYYlVweUFBZmh2NnJHVEp6Zk9scWhybTBjUVlRVndFY3lrSkZwQk90VU9ReGNSemwrbzVKaHNUZFpubWZRZU05ZEpCRnF0YTRyaUlGYVd5eFFTT3NqSVFzM1AvWmw0emQ2bUZoRkp0ZzdISjlLMHYwd0tua0ZPWTk0VmxQa3BvV2hZUGtQdEZjQ2VHQ3VwQXZORTVRY2MwNTlvMGF5VkJpa1JHRjY4ZmxTMlVocmJURGF4VVFldjNBSWt3VnFEbXZPTkg1V0pXbkJjVGN3ZWFSdFlHYXZqdGRtRmVtUjlnVm1JQStycy92SE5sWGFOUWM4eDd2TFZYalBsTnJ0NldYdStGeTZsUkRkNk1NWllSQmd0cHpWRzRnZTN2WGE0NFBsaE56dTFWd0l0d3JjNlRjQWc1RXVMeFRvZ3gzOVBUYWxlSnVSemN1dXlDeGlOUGlzVlRwYjQ4T0pUNC9rWkwxMDRvbS9vK2R5YjNSOCtVYmpLU3dXWGJ3bkUzRE5oZDN0VTFGdS9KT2lMRmJtc0V3aksvY0ErODUveXQ2YmhadFluZ09ETm85QytRTzY3WHJ3UmNNN1BVbWFzVFNoajF5Y1JUSis0dEFNOFd5VWhDSkVtVXlpQUJqSEpJd1BwUVlROXpzU3pVZEJtN0Rra09JcGZzNVBFaGlGeXBIYzJoZ3ZHZ2VMYnRQRXVnUS9McDZpek1yL0wzTXNjNmlEaW1hMDlvNE05aDhLQmJiRGR2YkdjVjk4T2xPY1JvS3dYN3ZnK01zZG8zYS82UFJhVE56bGxEendoUXozcGh1cE5xNnJYRGVGazhPZ3RCK2FpL3JkOWtXYUN2MHl3V01XN1JlS2F2T0cva2JpK2Z3bUYwQWFPckhkVXZNdU51TXhBaWhDa0l4ZkpNTC9xSXJRZGZmbmJFSlJFN1VzR0ZJZjB2UnI4REhGVXlKUDFJUXdEeXpkYUs5K2RDK3c3ZHBNR2NFanpXOWZuU09iWXpmZXZkekw3YkxuMW1GcGduVWlINVBHdXpQVkdTeXdqeHdFMjhCM1ZOemdXVGI4bjlsY3FidUhPVFdYWlBzY05WcTVZd1JGSzI1d3lmc2xkdnVjUUNmSjhWdlJpTzBuN2pTdmpOaEZmbWVCNDhCaGI0bkhuVWxmRFJhN2xMYnlVV0hHcDJ2NWpwbVpWc003NUdLLzUwRGNFRFEvLzdSUUJmV0l5d1ZJa1dFM1ZaTGl4Wlc4NDFhSGYvdXpnZElkU2IvSHEyTDB5bHZqRkZ3M1BJSjFNWHV0WDkvZU5CbHpwSHBsNUJlM2VQbTNwS1BsbC9oMHRQVnZKWUMwVHF2YU9WMEFmMDU2dlREajdva2RsalF6UWhYQUZyY0R6MTAzaG5MbUU3bFhFS01FUVFiK3d2MWpMTXk5U09qT2xvM2JCaEhlSU5MQjFhaG1RektWNWx5Y1V2Z3VsNEl2eGlKY0VJcFRMYWtRK25xUVRkclBTM0ZHTHM1MW92K1dwNWxiUkRHZjBXTjVaMVJ2QzdhN0NnSjJGcU8vNlRVNkhLcTFzdkVqeForN2JnS3BnYk83N2V4RXhScC9qaEZ4dmdOY3BGQU96UmhqY3cxb3dYdldUcFNIK0FHeW9kT0VYSkI5VWcwM09lMU0xc2tNTytTcEFoczAvbFlUeTFTUFZpOHRQTUdHSG01dnVPYllrdytxcXVTK3lOZVZRY3AzOXVGbFlqQjhwaEhNWi94MUJjWkg3Z1Exem5xWU96VVBQeUFVQXJrMnpSZThFam1SWjYrSHhJcnVPZDFmMFZabGdjZEZWenJKcEIwbVNrQXllNmdZUGY4bm9OajZDZExuMnAxRVVjR0oreHBibStiR1I3bjNpdHpJSlFwMTRBbEZRMG53R1RiVFcwcEtBTzg1V2FKMUMwUDVrT1hVSkNOYXU0d3cwSTFIYmZRTTV5SmMvSGFBbTA0UHloMy8zdFJaWktKbWdMemQ4Szc2cUlMQ2wvVUpLTmVxbTVGM2pvTEdjL1EwUDZTaldMZmVUMUtTQ2hqWFBOQXlkdlE3WUt6Q0drUjhGZy9yc0RaNjQvamM3dS90SVRoeFJFelJZQlJsWTNjSGdLTk9DRjd1ZnlMdHZkckk4TDh2L3hEejM2SU1KeTYrdUwweEZpcmZBcTdHcGxtNk11TXk3QVYwWEtOZGNtUlJHQ05rcTRtNzZWR29tRWJiaENZU29TV01lUWcrTlE0MGZrT0cwTnhVTzkvTzVBUnRQVEl6OHh2VXBodENxQ3doWGFiandaY004ODVCWjZjOVludVVobSs5dTUxR0ppeFQ2UStPSXplWlpDL1cyZFd4SzY4UWJjcFJIcktweGV3YlpoZkpOVWRhZFZ6RzNQMERWYVp5dVhORGdHSjlERVQ5dmJPdGgxWnp1bEZrNzhQQzFsaDZXT1NmTnhlM0FJNmQ3RWN6eTFEV1NIYlRjL25nU1NJd08rUHZQUm8yajlzOWcvV1BXYU9tUzIvZ3Nvdmt6d2ZuTmJ6YWwxU2J4eElJOTYwRy9Bbjg4ZEFoeWxkTnE1RytJUHpJMWRuYnZwZmhLeFd4d0IzQlpkTCsxVE43blk2TUJGdEtSbWF1QXREYzBmRTRkUHdlMTE2MGtDUlNtUkNIeWNndy9hZ0c2amRyU3Vlbjg4RURUT1F6Rmc0SzcyY3BncXJuOC91OGhDNnBDMzQvZzQ0QjBYNnJrdmFNNFlhblVVaXQ0TlJqYndxeUVBb28wMU1UMTM1MElKZE9lYkk3N3RRZGRkL2VmOW4vbG9VSUV0ZmU0cTRUeDU3T0dkMzlqTU5lRHhHS2tKQSs3STlUU2JYVVpkOUh3aFptVEhaRmtpZGl5WThrdFdDenpZYlRsMlFpT242blBLZzRSVGhROUdUVWp1aDg3dzZFcU5lTHF4d1Vhck0zQmFFa1NOQ244blRQOFh6SXl0enRLT1Btd0orTitJeW9majNEZzVIUjBLd1RtTmpob0FYZXpjTW5LRzB1d3BlOFBHaytnVFgzd2V5Rk9Gem9JNWtrK1V4bEg2V0FGdmc2LzZRT0o3Z1NKRGRqQnE3VkR3TnZvczFjNDlaUGNPME16ZjRRbFpQbHBqZXlDd0tnMllXd3NtNlZPbmdYdVVCcm5ldHgwVVBKakRrbTE3VmhJU3NFR3MvWU83TGpwNmdZOThmT0pPL0pqOHpqd3U1em82MHVLNnd4dEs3bDNwVWs3R2kxcjNxeEpVSGQrMWtYakhrOW9uZzc0VU1INUttRkZYMTNiTXNWL085cE1VbHhYQ01KWWxGY1pndjZ1S2E2Yi9WbU9hWnY3SHRyOFR5NTBZQVFRZ1BvRUFJQzlHWng3eUxxYitrcnkwMzBvaE1mcmVWTjd0VFNnenpNVUd5RXR2d3hlVnRGY3I5YnpQclBlZmdSWlpDVm1DYnRxd3c0OXFoeGJGV1ZSd0xRbzI1cWY0NkJ2UmlOZm9QU2c5aHFMa3Frb2Y1SzJkQ1Rlcm5ubjZNdHN0T0ZLcUhHaFhOQlFLaTlzaStLOTZsUUNLQVplMWtFSlE2MllzSk80bk44SXkrc3lmU25aa3J3dnBQakY1LzdNOWRGT3RWaXZyYXdBakJvanZLSTMvSldETGNIZ0k3Z09sS1R4Ri9lZnd1VnlxaFVNNDVJL0pWeXNjNHU0ellic3FLWjhLL3pWdGplcVd1VlhuUmhOSkZoS2dzVDl1aFFiV29sYm1vM2RZdGlQVXFEeURkUGtPYzRzbGg5Rm8yV3MwVmhhemcvUk5qL3VXVTJFVWtFSS9jUzlrN1dqTXVjYUt2cFFFMXZscHJaS04xbFpNMUZzMy9aUG4vS2lBNmlLc0MxaWJxd0hoRzViWXRDaEs4dXgyZTRtVkFXSXVvdEdsNmdFUHZvSGtncWJYNjRsS1ZvSENsdWt0ZUJrVFJhY1dCbkQyOVZ2c2FBbU9RZXJsN3FvZnhCTHhpNXM0ZUxybVptMzU0OG45VUIvckNsa3ZKY015SGxGZlFUaWQ1TlF1bnRaTkN3K0VNRDBmUmF6SWsyYkZBYUlrRWUzK0R0ejZYeFVta1JUUHcxczRpZTh6MkQwZjR0eVYyaHZxZUFMYW42d1BuVktBcUEwVWE5NHJ1T0FhK0FNYmY2WXd0TzUyRVRzdHR5QnltWmUvb0xJbEJXcHVETm1iUEhYd252ZUtyd3J1d2FtTXNieitkOEthUEx5N0RFRkY3amN5bjZLSmVCMVU4L0QwUFVMd3d2YlJrN0VUT21OMlVWWEhDK2Z6NCtjeVI5eE9YMWl2dHhZdWVhamtoeEtGY1dwUXY2a241VmFqa1ZaMEg5OEl1eUhYRUprVVQ0SHErTkFDcEtsb2pvZGV6VTdQNWVkUVdEbkM3UnArZXQzUjJCdG1qalk1dG5vVVRyWlo1RkcydkJIMUVIYjlyK0RudElobC90RWxRTWh4cWRJQ1VGVVI1N0dpRFVkRUxBWDZjK3hyeVFqZUpjcUdHelErT3g0WnBKbXVPNUVrYU1sNXFnM1E5bncwcVFTOFBnVjg1a3BkMmliYkk4OWY3cmRHeUVYbXFJRUxFemlYWXZpNE43U3ZlOFhBN1ZBbnpLZFY3Z0gyRkVjYXEwZDZSNHpjNG9VTllBT0NKSVVON25DS25rWGdDNGNGRmFkZ1FqOFFFaWkzcjhMekZFWFBhMVNpYmVKbkpLc2JCbVhnNTZ6UGVtY1psOHpHeG1LeXdzQWt6dmxtRXdkbDZRQTdRWWlwL1o4Qyt5eUh3aXN4dkNYdDVtem1WNFJVVXFiMjdJenFCWDF1K0piSDUwU2h3bWFJWjRyL1BCU2lmVUlXaDRlOGU0eEV2aTRVS3pVRzl4dXdZTTN6bG1YK0RyenBSTWVDcC94SFNFbXdQa0daQkJWb0JYZHNGbE1mczFkcFg4anB5NytEck14bzZiQ0R6UlRJd2V2ZEZNUmpYR3JDMW1KUllVMENDQzFvNWduSUNKczB1ZWdWanluL1Z5RFZiVE1XM2YzcSs2UVRpOGhsdE5iSmZlWkZGNHU2bVdRenB4NUtIUDN6SGg4R1R1MnlnemF1azU1Rzd5L1RCTXZDdlRHcWhCUWt1WWhieXJYV3VORWFJVnJHck1yRGlDdld4Qi9Zb1U3T2UrWHBBekYxUTJqYnArdDZVWC9RVmpiSHZ6ZnM5NkNIUFBPQ0J2OUFOTUNoR3JjK29LanoxV2ZNZ1REbFJTK0JsdGdNbkVYVy8vN0hhd3BBdDRGaVkvREMvVjc1ekNHdSt5MUNqQmpEcDRROTZjMnUzK0hkbFgrWWMvL1lzUW1WTnhEQUhLTmNsTlV2ZktIb1dKeFBsRzlMdEpYNFZlZ0o4NGU4VlhTUllPRVh3c013UjZkcDV4Q2pUU2lNK1hrUW5NV1A4MTNncldVMmM0YVdLQnhsSzdZRmVSSGMrVXEwREFvOUdCWEJWdVI4Q3dMRmwvVFlhSzM1eSswNFlXRVhIWTgxa3FCT2s3S2k3WU9SemhCeU45UitnTFY4eHdBUnYyWUs0YlhuQ0NnWkNxeEtCc25NNzRCZjZtekozamFveHNlU1JrSVJXaTVkU1JrVy9FNkk4TnV2QnF3R3BRV2xacHpnSnRpd0tLT2EwWlZUY2RMaXF1KytHT3FFcFZnSDVJTWxORjZlOGxyNUthR2t6MVYyK0JUY0NwVTh3cGtnUDdOR25TaFRweEswT3BwdDB1cDdYZ0hnUUo2dEswNllBU1VRNlFmY2pObzhwcGNKcm9Wbk13emIxZXZSR2VVb3hxdzdIcCtiRm42ZDRrckhmVXR4Y3d2VXNCQzV0TEtxQWZNMDgrRFd3dUdTeGloYkU4MWlNczNDZmZxZ3ZRU3o5NS9iY2huWmNhWnBabnMxc1BSQ1BudGY1WXQyNGJHb2s0TjRnanVlY3BjempIMjhEVWxPZnh6NkUwWHNEVjVpdEwxT1hLNjZRSWdVT1ZIaU9ZTjhzV1l0UWxtRXJ6MnF3cWVMV1NUMWczY0RZaTA2bThtbHZjc3FndTg5S25wSU1WSGVrVVhCdS9weVVFdVdveVl0b0F5blUyNHQzN2hwZlpWbXZaRUk1T3FoSE5BMFFyNk5VZFNIM3JkakJ5czNXUS9jWWFDQ2pSRzFlYVRtRStMRnNmZXZSeEJReWREWnc5SmhFbTI5bFhNVmpRS3ZvK1dMZm1mR1daYkM0Q2RmT21FWlBLQUEybWhlVlNBWGVsV1M0aTlIUEJpdWFacWkxRGY0cVg1NmxqYTRocTJ5YkJmY3lUVU80NWlvWDI5WXV5MnIxNDZ3UktyV1lTeFFqdFV2RVhpVUQzR1JKanhCZVI1Q0hmMnN4YW5KRUF4eUNnZkJkUXZPdkI5alMzZDlnQm1LZ01JVFJKY1gweDY3cGVISU4zRjBreE9pYUU0ODJpL2g4ZzRFWnJVeDlMNHo4RGpYYlBJYWZsb21NYkNRMldIQlhZM0dXcUJjcjNXM1VhV3B0Y0czcG44VzF2WCtqVnR2UTd6TTMrY093NE5kYXVuc0oxZTZjandVM1d1RFZTbmtGTVNOYkxjVHdyamtDdz09IiwiaXYiOiJiOTFmMzc0MGEyNWFjMmViYWJiMTVkNzhjZDQxN2ZkYSIsInMiOiI0Y2NmOTA3MTk2YTBhY2IyIn0%3D&public_key=35536E1E-65B4-4D96-9D97-6ADB7EFF8147&site=https%3A%2F%2Fchat.openai.com&userbrowser=Mozilla%2F5.0%20(Macintosh%3B%20Intel%20Mac%20OS%20X%2010_15_7)%20AppleWebKit%2F537.36%20(KHTML%2C%20like%20Gecko)%20Chrome%2F113.0.0.0%20Safari%2F537.36&capi_version=1.5.2&capi_mode=lightbox&style_theme=default&rnd=${Math.random()}`,
    method: 'POST',
  }).then((response) => response.json());
}
function generateChat(message, conversationId, messageId, parentMessageId, token, saveHistory = true, role = 'user', action = 'next') {
  return chrome.storage.local.get(['settings', 'enabledPluginIds']).then((res) => chrome.storage.sync.get(['auth_token']).then((result) => {
    const payload = {
      action,
      arkose_token: res.settings.selectedModel.slug.includes('gpt-4') ? token : null,
      model: res.settings.selectedModel.slug,
      parent_message_id: parentMessageId,
      history_and_training_disabled: !saveHistory,
      timezone_offset_min: new Date().getTimezoneOffset(),
    };
    if (action === 'next') {
      payload.messages = messageId
        ? [
          {
            id: messageId,
            author: { role },
            content: {
              content_type: 'text',
              parts: [message],
            },
          },
        ]
        : null;
    }
    if (conversationId) {
      payload.conversation_id = conversationId;
    }
    // plugin model: text-davinci-002-plugins
    if (!conversationId && res.settings.selectedModel.slug.includes('plugins')) {
      payload.plugin_ids = res.enabledPluginIds;
    }
    const eventSource = new SSE(
      '/backend-api/conversation',
      {
        method: 'POST',
        headers: {
          ...defaultHeaders,
          accept: 'text/event-stream',
          Authorization: result.auth_token,
        },
        payload: JSON.stringify(payload),
      },
    );
    eventSource.stream();
    return eventSource;
  }));
}
function getConversation(conversationId) {
  return chrome.storage.local.get(['conversations', 'conversationsAreSynced', 'settings']).then((res) => {
    const { conversations, conversationsAreSynced } = res;
    const { autoSync } = res.settings;
    if ((typeof autoSync === 'undefined' || autoSync) && conversationsAreSynced && conversations && conversations[conversationId]) {
      if (!conversations[conversationId].shouldRefresh) {
        return conversations[conversationId];
      }
    }
    return chrome.storage.sync.get(['auth_token']).then((result) => fetch(`https://chat.openai.com/backend-api/conversation/${conversationId}`, {
      method: 'GET',
      headers: {
        ...defaultHeaders,
        Authorization: result.auth_token,
      },

    }).then((response) => {
      if (response.ok) {
        return response.json();
      }
      return Promise.reject(response);
    }));
  });
}
function getAccount() {
  return chrome.storage.sync.get(['auth_token']).then((result) => fetch('https://chat.openai.com/backend-api/accounts/check', {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.auth_token,
    },
  }).then((response) => response.json()))
    .then((data) => {
      if (data.account_plan) {
        chrome.storage.local.get(['account'], (res) => {
          chrome.storage.local.set({ ...res.account, account: data });
        });
      }
    });
}
// {
//   "account_plan": {
//     "is_paid_subscription_active": true,
//     "subscription_plan": "chatgptplusplan",
//     "account_user_role": "account-owner",
//     "was_paid_customer": true,
//     "has_customer_object": true
//   },
//   "user_country": "US",
//   "features": [
//     "model_switcher",
//     "system_message"
//   ]
// }
function getModels() {
  return chrome.storage.sync.get(['auth_token']).then((result) => fetch('https://chat.openai.com/backend-api/models', {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.auth_token,
    },
  }).then((response) => response.json()))
    .then((data) => {
      if (data.models) {
        chrome.storage.local.get(['settings', 'models', 'account'], (res) => {
          const { models, settings, account } = res;
          chrome.storage.local.set({
            models: data.models,
            settings: { ...settings, selectedModel: settings.selectedModel || data.models?.[0] },
          });
          if (data.models.map((m) => m.slug).find((m) => m.includes('plugins'))) {
            const isPaid = account?.account_plan?.is_paid_subscription_active || account?.accounts?.default?.entitlement?.has_active_subscription || false;
            if (isPaid) {
              getAllPlugins();
              getInstalledPlugins();
            }
          }
        });
      }
    });
}
function getConversationLimit() {
  return fetch('https://chat.openai.com/public-api/conversation_limit', {
    method: 'GET',
    headers: {
      ...defaultHeaders,
    },
  }).then((response) => response.json())
    .then((data) => {
      if (data.message_cap) {
        chrome.storage.local.set({
          conversationLimit: data,
        });
      }
    });
}
function messageFeedback(conversationId, messageId, rating, text = '') {
  const data = {
    conversation_id: conversationId,
    message_id: messageId,
    rating,
    tags: [],
  };
  if (text) {
    data.text = text;
  }
  return chrome.storage.sync.get(['auth_token']).then((result) => fetch('https://chat.openai.com/backend-api/conversation/message_feedback', {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      Authorization: result.auth_token,
    },
    body: JSON.stringify(data),
  }).then((res) => res.json()));
}
function getAllPlugins() {
  return getPlugins(0, 250, undefined, 'approved').then((res) => {
    chrome.storage.local.set({
      allPlugins: res.items,
    });
  });
}
function getApprovedPlugins() {
  getPlugins(0, 100, undefined, 'approved').then((res) => res);
}
function getInstalledPlugins() {
  getPlugins(0, 100, true, undefined).then((res) => {
    chrome.storage.local.set({
      installedPlugins: res.items,
    });
  });
}
function getPlugins(offset = 0, limit = 20, isInstalled = undefined, statuses = undefined) {
  const url = new URL('https://chat.openai.com/backend-api/aip/p');
  // without passing limit it returns 20 by default
  // limit cannot be more than 100
  const params = { offset, limit };
  url.search = new URLSearchParams(params).toString();
  if (isInstalled !== undefined) {
    url.searchParams.append('is_installed', isInstalled);
  }
  if (statuses) {
    url.searchParams.append('statuses', statuses);
  }
  return chrome.storage.sync.get(['auth_token']).then((result) => fetch(url, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.auth_token,
    },
  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(res);
  }));
}
function installPlugin(pluginId) {
  const url = new URL(`https://chat.openai.com/backend-api/aip/p/${pluginId}/user-settings`);
  // without passing limit it returns 20 by default
  // limit cannot be more than 100
  const data = {
    is_installed: true,
  };
  return chrome.storage.sync.get(['auth_token']).then((result) => fetch(url, {
    method: 'PATCH',
    headers: {
      ...defaultHeaders,
      Authorization: result.auth_token,
    },
    body: JSON.stringify(data),

  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(res);
  }));
}
function uninstallPlugin(pluginId) {
  const url = new URL(`https://chat.openai.com/backend-api/aip/p/${pluginId}/user-settings`);
  // without passing limit it returns 20 by default
  // limit cannot be more than 100
  const data = {
    is_installed: false,
  };
  return chrome.storage.sync.get(['auth_token']).then((result) => fetch(url, {
    method: 'PATCH',
    headers: {
      ...defaultHeaders,
      Authorization: result.auth_token,
    },
    body: JSON.stringify(data),

  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(res);
  }));
}
function userSettings(pluginId) {
  const url = new URL(`https://chat.openai.com/backend-api/aip/${pluginId}/user-settings`);
  return chrome.storage.sync.get(['auth_token']).then((result) => fetch(url, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.auth_token,
    },
  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(res);
  }));
}

function createShare(conversationId, currentNodeId, isAnnonymous = true) {
  const url = new URL('https://chat.openai.com/backend-api/share/create');
  // without passing limit it returns 50 by default
  // limit cannot be more than 20
  const data = {
    is_anonymous: isAnnonymous,
    conversation_id: conversationId,
    current_node_id: currentNodeId,
    // message_id: `aaa1${self.crypto.randomUUID().slice(4)}`,
  };
  return chrome.storage.sync.get(['auth_token']).then((result) => fetch(url, {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      Authorization: result.auth_token,
    },
    body: JSON.stringify(data),

  }).then((res) => {
    if (res.ok) {
      const jsonData = res.json();
      // if (!jsonData.already_exists) {
      //   getSharedConversations().then((sharedConversations) => {
      //     const conversation = sharedConversations.items.find((c) => c.conversation_id === conversationId);
      //     chrome.storage.local.get(['conversations'], (localResult) => {
      //       chrome.storage.local.set({
      //         conversations: {
      //           ...localResult.conversations,
      //           [conversationId]: {
      //             ...Object.values(localResult.conversations).find((c) => c.id === conversationId),
      //             update_time: new Date(conversation.update_time).getTime() / 1000,
      //           },
      //         },
      //       });
      //     });
      //   });
      // }
      return jsonData;
    }
    return Promise.reject(res);
  }));
}

function share(shareId, title, highlightedMessageId, isAnonymous = true, isVisibile = true, isPublic = true) {
  const url = new URL(`https://chat.openai.com/backend-api/share/${shareId}`);
  // without passing limit it returns 50 by default
  // limit cannot be more than 20
  const data = {
    is_public: isPublic,
    is_anonymous: isAnonymous,
    is_visible: isVisibile,
    title,
    highlighted_message_id: highlightedMessageId,
    share_id: shareId,
  };
  return chrome.storage.sync.get(['auth_token']).then((result) => fetch(url, {
    method: 'PATCH',
    headers: {
      ...defaultHeaders,
      Authorization: result.auth_token,
    },
    body: JSON.stringify(data),

  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(res);
  }));
}

function deleteShare(shareId) {
  const url = new URL(`https://chat.openai.com/backend-api/share/${shareId}`);
  // without passing limit it returns 50 by default
  // limit cannot be more than 20
  return chrome.storage.sync.get(['auth_token']).then((result) => fetch(url, {
    method: 'DELETE',
    headers: {
      ...defaultHeaders,
      Authorization: result.auth_token,
    },
  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(res);
  }));
}
// returnsa thenable promise. If selectedConversations exist, return them, otherwise get all conversations
function getSelectedConversations(forceRefresh = false) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['selectedConversations'], (result) => {
      if (!forceRefresh && result.selectedConversations && result.selectedConversations.length > 0) {
        resolve(result.selectedConversations);
      } else {
        resolve(getAllConversations());
      }
    });
  });
}

function getAllConversations(forceRefresh = false) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['conversations', 'conversationsAreSynced', 'settings']).then((res) => {
      const { conversations, conversationsAreSynced, settings } = res;
      const { autoSync } = settings;
      if (!forceRefresh && conversationsAreSynced && (typeof autoSync === 'undefined' || autoSync)) {
        const visibleConversation = Object.values(conversations);
        resolve(visibleConversation);
      } else {
        const allConversations = [];
        getConversations().then((convs) => {
          const {
            limit, offset, items,
          } = convs;
          const total = convs.total ? Math.min(convs.total, 10000) : 10000; // sync last 10000 conversations
          if (items.length === 0 || total === 0) {
            resolve([]);
            return;
          }
          allConversations.push(...items);
          if (offset + limit < total) {
            const promises = [];
            for (let i = 1; i < Math.ceil(total / limit); i += 1) {
              promises.push(getConversations(i * limit, limit));
            }
            Promise.all(promises).then((results) => {
              results.forEach((result) => {
                if (result.items) {
                  allConversations.push(...result.items);
                }
              });
              resolve(allConversations);
            }, (err) => {
              if (conversationsAreSynced) {
                const visibleConversation = Object.values(conversations).filter((conversation) => !conversation.archived && !conversation.skipped);
                resolve(visibleConversation);
              }
              resolve(Promise.reject(err));
            });
          } else {
            resolve(allConversations);
          }
        }, (err) => {
          if (conversationsAreSynced) {
            const visibleConversation = Object.values(conversations).filter((conversation) => !conversation.archived && !conversation.skipped);
            resolve(visibleConversation);
          }
          resolve(Promise.reject(err));
        });
      }
    });
  });
}
function getSharedConversations(offset = 0, limit = 100) {
  const url = new URL('https://chat.openai.com/backend-api/shared_conversations');
  // without passing limit it returns 50 by default
  // limit cannot be more than 20
  // const params = { offset, limit };
  // url.search = new URLSearchParams(params).toString();
  return chrome.storage.sync.get(['auth_token']).then((result) => fetch(url, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.auth_token,
    },
  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(res);
  }));
}
function getConversations(offset = 0, limit = 100, order = 'updated') {
  const url = new URL('https://chat.openai.com/backend-api/conversations');
  // without passing limit it returns 50 by default
  // limit cannot be more than 20
  const params = { offset, limit, order };
  url.search = new URLSearchParams(params).toString();
  return chrome.storage.sync.get(['auth_token']).then((result) => fetch(url, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      Authorization: result.auth_token,
    },
  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(res);
  }));
}
function updateConversation(id, data) {
  return chrome.storage.sync.get(['auth_token']).then((result) => fetch(`https://chat.openai.com/backend-api/conversation/${id}`, {
    method: 'PATCH',
    headers: {
      ...defaultHeaders,
      Authorization: result.auth_token,
    },
    body: JSON.stringify(data),
  }).then((res) => res.json()));
}
function generateTitle(conversationId, messageId) {
  return chrome.storage.local.get(['settings']).then((res) => {
    const data = {
      message_id: messageId,
      model: res.settings.selectedModel.slug,
    };
    return chrome.storage.sync.get(['auth_token']).then((result) => fetch(`https://chat.openai.com/backend-api/conversation/gen_title/${conversationId}`, {
      method: 'POST',
      headers: {
        ...defaultHeaders,
        Authorization: result.auth_token,
      },
      body: JSON.stringify(data),
    }).then((response) => response.json()));
  });
}
function renameConversation(conversationId, title) {
  return chrome.storage.sync.get(['auth_token']).then((result) => fetch(`https://chat.openai.com/backend-api/conversation/${conversationId}`, {
    method: 'PATCH',
    headers: {
      ...defaultHeaders,
      Authorization: result.auth_token,
    },
    body: JSON.stringify({ title }),
  }).then((res) => res.json()));
}
function deleteConversation(conversationId) {
  return chrome.storage.local.get(['conversations']).then((localRes) => {
    const { conversations } = localRes;
    if (!conversations[conversationId].saveHistory) {
      return { success: true };
    }
    return chrome.storage.sync.get(['auth_token']).then((result) => fetch(`https://chat.openai.com/backend-api/conversation/${conversationId}`, {
      method: 'PATCH',
      headers: {
        ...defaultHeaders,
        Authorization: result.auth_token,
      },
      body: JSON.stringify({ is_visible: false }),
    }).then((res) => {
      if (res.ok) {
        return res.json();
      }
      return Promise.reject(res);
    }));
  });
}
function deleteAllConversations() {
  return chrome.storage.sync.get(['auth_token']).then((result) => fetch('https://chat.openai.com/backend-api/conversations', {
    method: 'PATCH',
    headers: {
      ...defaultHeaders,
      Authorization: result.auth_token,
    },
    body: JSON.stringify({ is_visible: false }),
  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(res);
  }));
}
function submitPrompt(openAiId, prompt, promptTitle, categories, promptLangage, modelSlug, nickname, url, hideFullPrompt = false, promptId = null) {
  chrome.storage.sync.set({
    name,
    url,
  });
  const body = {
    openai_id: openAiId,
    text: prompt.trim(),
    title: promptTitle.trim(),
    nickname,
    hide_full_prompt: hideFullPrompt,
    url,
  };
  if (modelSlug) {
    body.model_slug = modelSlug;
  }
  if (promptId) {
    body.prompt_id = promptId;
  }
  if (categories) {
    body.categories = categories.map((category) => category.trim().toLowerCase().replaceAll(/\s/g, '_')).join(',');
  }
  if (promptLangage && promptLangage !== 'select') {
    body.language = promptLangage;
  }
  return fetch(`${API_URL}/gptx/add-prompt/`, {
    method: 'POST',
    headers: {
      ...defaultHeaders,
    },
    body: JSON.stringify(body),
  }).then((res) => res.json());
}

function deletePrompt(promptId) {
  return chrome.storage.sync.get(['openai_id']).then((result) => {
    const openAiId = result.openai_id;
    return fetch(`${API_URL}/gptx/delete-prompt/`, {
      method: 'POST',
      headers: {
        ...defaultHeaders,
      },
      body: JSON.stringify({
        openai_id: openAiId,
        prompt_id: promptId,
      }),
    }).then((res) => res.json());
  });
}
function getNewsletters() {
  return fetch(`${API_URL}/gptx/newsletters/`, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
    },
  }).then((res) => res.json());
}
function getNewsletter(id) {
  return fetch(`${API_URL}/gptx/${id}/newsletter/`, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
    },
  }).then((res) => res.json());
}
function getLatestNewsletter(id) {
  return fetch(`${API_URL}/gptx/latest-newsletter/`, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
    },
  }).then((res) => res.json());
}
function getReleaseNote(version) {
  return fetch(`${API_URL}/gptx/release-notes/`, {
    method: 'POST',
    headers: {
      ...defaultHeaders,
    },
    body: JSON.stringify({ version }),
  }).then((res) => res.json());
}
function getLatestAnnouncement() {
  return fetch(`${API_URL}/gptx/announcements/`, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
    },
  }).then((res) => res.json());
}
function getSponsor(version) {
  return fetch(`${API_URL}/gptx/sponsor/`, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
    },
  }).then((res) => res.json());
}
function getPrompts(pageNumber, searchTerm, sortBy = 'recent', language = 'all', category = 'all') {
  // get user id from sync storage
  return chrome.storage.sync.get(['openai_id']).then((result) => {
    const openaiId = result.openai_id;
    let url = `${API_URL}/gptx/?order_by=${sortBy}`;
    if (sortBy === 'mine') url = `${API_URL}/gptx/?order_by=${sortBy}&id=${openaiId}`;
    if (pageNumber) url += `&page=${pageNumber}`;
    if (language !== 'all') url += `&language=${language}`;
    if (category !== 'all') url += `&category=${category}`;
    if (searchTerm && searchTerm.trim().length > 0) url += `&search=${searchTerm}`;
    return fetch(url)
      .then((response) => response.json());
  });
}
function getPrompt(pid) {
  // get user id from sync storage
  return chrome.storage.sync.get(['openai_id']).then((result) => {
    const openaiId = result.openai_id;
    const url = `${API_URL}/gptx/${pid}/`;
    return fetch(url)
      .then((response) => response.json());
  });
}

function incrementUseCount(promptId) {
  return chrome.storage.sync.get(['openai_id']).then((result) => {
    const openaiId = result.openai_id;
    // increment use count
    const url = `${API_URL}/gptx/${promptId}/use-count/`;
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ openai_id: openaiId }),
    }).then((response) => response.json());
  });
}

function vote(promptId, voteType) {
  return chrome.storage.sync.get(['openai_id']).then((result) => {
    const openaiId = result.openai_id;
    // update vote count
    const url = `${API_URL}/gptx/${promptId}/vote/`;
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ openai_id: openaiId, vote_type: voteType }),
    }).then((response) => response.json());
  });
}

function report(promptId) {
  return chrome.storage.sync.get(['openai_id']).then((result) => {
    const openaiId = result.openai_id;
    // increment report count
    const url = `${API_URL}/gptx/${promptId}/report/`;
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ openai_id: openaiId }),
    }).then((response) => response.json());
  });
}

function incrementOpenRate(newsletterId) {
  const url = `${API_URL}/gptx/increment-open-rate/`;
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ newsletter_id: newsletterId }),
  }).then((response) => response.json());
}

function incrementClickRate(newsletterId) {
  const url = `${API_URL}/gptx/increment-click-rate/`;
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ newsletter_id: newsletterId }),
  }).then((response) => response.json());
}

function updateEmailNewsletter(emailNewsletter) {
  chrome.storage.sync.get(['openai_id'], (result) => {
    const openaiId = result.openai_id;
    // increment report count
    const url = `${API_URL}/gptx/update-email-newsletter/`;
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ p: openaiId, email_newsletter: emailNewsletter }),
    });
  });
}
