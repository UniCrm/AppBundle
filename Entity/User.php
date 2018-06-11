<?php

namespace  UniCrm\Bundles\AppBundle\Entity;

use FOS\UserBundle\Model\User as BaseUser;
use Doctrine\ORM\Mapping as ORM;


/**
 * Class User
 * @ORM\Entity(repositoryClass="UniCrm\Bundles\AppBundle\Repository\UserRepository")
 * @ORM\Table(name="users")
 */
class User extends BaseUser{

    /**
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     * @ORM\Column(type="integer")
     */
    protected $id;


    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }




}