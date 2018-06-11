<?php

namespace  UniCrm\Bundles\AppBundle\Security;


use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class BaseVoter extends Voter{

    CONST  ACCESS_OWNER = 'ACCESS_OWNER';


    protected function supports($attribute, $subject)
    {

        if (!in_array($attribute , $this->getSupportedAttributes())){
            return false;
        }

        return true;
    }


    protected function getSupportedAttributes(){
        return [
            self::ACCESS_OWNER
        ];
    }


    protected function  voteOnAttribute($attribute, $subject, TokenInterface $token){

        $user = $token->getUser();

        switch ($attribute){
            case self::ACCESS_OWNER :
                return $this->accessOwner($subject , $user);
        }

    }

    protected function accessOwner($subject , $user){
        return $order->getCreatedBy()->getId() == $user->getId();
    }


}